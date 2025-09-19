# KYC Registration API Routes
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
import json
import uuid
import os

from database import get_db
from auth import get_current_user, require_role
from models import User, TouristProfile, KYCDocument, DigitalIDRecord, KYCStatus, DocumentType
from blockchain_tourist_id import blockchain_service

# Enhanced schemas (inline for now)
from pydantic import BaseModel, Field, validator

class TouristKYCRegistration(BaseModel):
    # Personal Information
    full_name: str = Field(..., min_length=2, max_length=100)
    date_of_birth: str = Field(..., description="YYYY-MM-DD format")
    nationality: str = Field(..., min_length=2, max_length=50)
    phone_number: str = Field(..., min_length=10, max_length=20)
    
    # Emergency Contact
    emergency_contact: str = Field(..., min_length=10, max_length=20)
    emergency_contact_relation: str = Field(..., min_length=2, max_length=50)
    
    # Documents
    passport_number: str = Field(..., min_length=6, max_length=20)
    aadhaar_number: Optional[str] = Field(None, min_length=12, max_length=12)
    
    # Trip Information
    planned_entry_date: str = Field(..., description="YYYY-MM-DD format")
    planned_exit_date: str = Field(..., description="YYYY-MM-DD format")
    entry_point: str = Field(..., min_length=2, max_length=100)
    purpose_of_visit: str = Field(..., min_length=2, max_length=200)
    accommodation_details: Optional[str] = None
    
    # Planned Itinerary (JSON string)
    planned_itinerary: Optional[str] = None

class KYCStatusResponse(BaseModel):
    success: bool
    message: str
    tourist_id: Optional[int] = None
    kyc_status: str
    verification_progress: float
    blockchain_id: Optional[str] = None
    digital_id_valid_until: Optional[str] = None
    next_steps: List[str]
    required_documents: List[str]

kyc_router = APIRouter(prefix="/api/kyc", tags=["KYC Registration"])

@kyc_router.post("/register", response_model=KYCStatusResponse)
async def register_tourist_kyc(
    kyc_data: TouristKYCRegistration,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Complete KYC registration for tourists with blockchain digital ID creation.
    This endpoint handles the full registration process including:
    - Personal information validation
    - Document verification setup
    - Blockchain digital ID creation
    - Trip itinerary registration
    """
    try:
        # Check if tourist profile already exists
        existing_profile = db.query(TouristProfile).filter(
            TouristProfile.user_id == current_user.id
        ).first()
        
        if existing_profile and existing_profile.kyc_status != KYCStatus.PENDING:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="KYC registration already completed or in progress"
            )
        
        # Parse dates
        try:
            date_of_birth = datetime.strptime(kyc_data.date_of_birth, "%Y-%m-%d")
            planned_entry_date = datetime.strptime(kyc_data.planned_entry_date, "%Y-%m-%d")
            planned_exit_date = datetime.strptime(kyc_data.planned_exit_date, "%Y-%m-%d")
        except ValueError as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid date format. Use YYYY-MM-DD: {str(e)}"
            )
        
        # Validate trip dates
        if planned_exit_date <= planned_entry_date:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Exit date must be after entry date"
            )
        
        # Validate age (must be 18+)
        age = (datetime.now() - date_of_birth).days // 365
        if age < 18:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Tourist must be at least 18 years old"
            )
        
        # Parse accommodation details and itinerary
        accommodation_data = None
        itinerary_data = None
        
        if kyc_data.accommodation_details:
            try:
                accommodation_data = json.loads(kyc_data.accommodation_details)
            except json.JSONDecodeError:
                accommodation_data = {"description": kyc_data.accommodation_details}
        
        if kyc_data.planned_itinerary:
            try:
                itinerary_data = json.loads(kyc_data.planned_itinerary)
            except json.JSONDecodeError:
                itinerary_data = [{"description": kyc_data.planned_itinerary}]
        
        # Create or update tourist profile
        if existing_profile:
            profile = existing_profile
        else:
            profile = TouristProfile(user_id=current_user.id)
            db.add(profile)
        
        # Update profile with KYC data
        profile.passport_number = kyc_data.passport_number
        profile.nationality = kyc_data.nationality
        profile.date_of_birth = date_of_birth
        profile.phone_number = kyc_data.phone_number
        profile.emergency_contact = kyc_data.emergency_contact
        profile.emergency_contact_relation = kyc_data.emergency_contact_relation
        profile.aadhaar_number = kyc_data.aadhaar_number
        profile.planned_entry_date = planned_entry_date
        profile.planned_exit_date = planned_exit_date
        profile.entry_point = kyc_data.entry_point
        profile.purpose_of_visit = kyc_data.purpose_of_visit
        profile.accommodation_details = json.dumps(accommodation_data) if accommodation_data else None
        profile.kyc_status = KYCStatus.UNDER_REVIEW
        
        # Create KYC documents
        passport_doc = KYCDocument(
            tourist_id=profile.id if profile.id else None,
            document_type=DocumentType.PASSPORT,
            document_number=kyc_data.passport_number,
            verification_status=KYCStatus.PENDING
        )
        db.add(passport_doc)
        
        if kyc_data.aadhaar_number:
            aadhaar_doc = KYCDocument(
                tourist_id=profile.id if profile.id else None,
                document_type=DocumentType.AADHAAR,
                document_number=kyc_data.aadhaar_number,
                verification_status=KYCStatus.PENDING
            )
            db.add(aadhaar_doc)
        
        # Commit to get profile ID
        db.commit()
        db.refresh(profile)
        
        # Update document tourist_id if it was None
        if not passport_doc.tourist_id:
            passport_doc.tourist_id = profile.id
        if kyc_data.aadhaar_number and hasattr(locals(), 'aadhaar_doc') and not aadhaar_doc.tourist_id:
            aadhaar_doc.tourist_id = profile.id
        
        # Create blockchain digital ID with enhanced KYC and Aadhar integration
        blockchain_data = {
            "full_name": kyc_data.full_name,
            "date_of_birth": date_of_birth.isoformat(),
            "nationality": kyc_data.nationality,
            "phone_number": kyc_data.phone_number,
            "email": current_user.email,
            "passport_number": kyc_data.passport_number,
            "passport_verified": False,  # Will be verified later through document upload
            "aadhaar_number": kyc_data.aadhaar_number,
            "aadhaar_verified": False,  # Will be verified through UIDAI integration
            "aadhaar_biometric_verified": False,
            "emergency_contact": kyc_data.emergency_contact,
            "emergency_contact_relation": kyc_data.emergency_contact_relation,
            "planned_entry_date": planned_entry_date.isoformat(),
            "planned_exit_date": planned_exit_date.isoformat(),
            "entry_point": kyc_data.entry_point,
            "purpose_of_visit": kyc_data.purpose_of_visit,
            "accommodation_details": accommodation_data,
            "planned_itinerary": itinerary_data,
            "gdpr_consent": True,
            "privacy_level": "standard",
            "medical_conditions_declared": False,
            "verification_source": "kyc_registration_with_aadhaar" if kyc_data.aadhaar_number else "kyc_registration"
        }
        
        blockchain_result = blockchain_service.create_tourist_id(blockchain_data)
        
        if blockchain_result.get("success"):
            # Update profile with blockchain info
            profile.blockchain_id = blockchain_result.get("tourist_id")
            profile.blockchain_transaction_hash = blockchain_result.get("transaction_id")
            profile.digital_id_valid_until = planned_exit_date
            profile.digital_id_status = "active"
            
            # Create digital ID record
            digital_id_record = DigitalIDRecord(
                tourist_id=profile.id,
                blockchain_id=blockchain_result.get("tourist_id"),
                transaction_hash=blockchain_result.get("transaction_id"),
                public_key=blockchain_result.get("public_key"),
                private_key_hash="hashed_private_key",  # Should be properly hashed
                valid_from=planned_entry_date,
                valid_until=planned_exit_date,
                status="active",
                issuing_authority="SecureSafar Tourism Authority",
                issue_point=kyc_data.entry_point
            )
            db.add(digital_id_record)
            
            db.commit()
            
            # Calculate verification progress
            verification_progress = 30.0  # Basic registration complete
            next_steps = [
                "Upload passport document",
                "Complete biometric verification",
                "Wait for document verification",
                "Receive digital ID activation"
            ]
            
            if kyc_data.aadhaar_number:
                next_steps.insert(1, "Upload Aadhaar document")
            
            required_documents = ["passport_photo", "visa_if_required"]
            if kyc_data.aadhaar_number:
                required_documents.append("aadhaar_photo")
            
            return KYCStatusResponse(
                success=True,
                message="KYC registration completed successfully! Digital ID created on blockchain with Aadhar integration support.",
                tourist_id=profile.id,
                kyc_status="under_review",
                verification_progress=verification_progress,
                blockchain_id=profile.blockchain_id,
                digital_id_valid_until=planned_exit_date.isoformat(),
                next_steps=next_steps,
                required_documents=required_documents
            )
        else:
            # Blockchain creation failed, but profile created
            db.commit()
            return KYCStatusResponse(
                success=False,
                message=f"Profile created but blockchain ID creation failed: {blockchain_result.get('error')}",
                tourist_id=profile.id,
                kyc_status="pending",
                verification_progress=10.0,
                next_steps=["Contact support for blockchain ID creation", "Upload required documents"],
                required_documents=["passport_photo", "aadhaar_photo"]
            )
    
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"KYC registration failed: {str(e)}"
        )

@kyc_router.get("/status/{tourist_id}", response_model=KYCStatusResponse)
async def get_kyc_status(
    tourist_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get KYC verification status for a tourist"""
    try:
        # Check if user has permission to view this tourist's status
        if current_user.role.value not in ["police", "tourism_authority"]:
            # Regular users can only view their own status
            profile = db.query(TouristProfile).filter(
                TouristProfile.id == tourist_id,
                TouristProfile.user_id == current_user.id
            ).first()
        else:
            # Authorities can view any tourist's status
            profile = db.query(TouristProfile).filter(
                TouristProfile.id == tourist_id
            ).first()
        
        if not profile:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Tourist profile not found or access denied"
            )
        
        # Get KYC documents
        documents = db.query(KYCDocument).filter(
            KYCDocument.tourist_id == tourist_id
        ).all()
        
        # Calculate verification progress
        total_docs = len(documents)
        verified_docs = len([doc for doc in documents if doc.verification_status == KYCStatus.VERIFIED])
        
        base_progress = 30.0 if profile.kyc_status != KYCStatus.PENDING else 0.0
        doc_progress = (verified_docs / max(total_docs, 1)) * 70.0
        verification_progress = base_progress + doc_progress
        
        # Determine next steps
        next_steps = []
        required_documents = []
        
        if profile.kyc_status == KYCStatus.PENDING:
            next_steps.append("Complete initial registration")
        elif profile.kyc_status == KYCStatus.UNDER_REVIEW:
            pending_docs = [doc for doc in documents if doc.verification_status == KYCStatus.PENDING]
            if pending_docs:
                next_steps.append("Wait for document verification")
                for doc in pending_docs:
                    required_documents.append(f"{doc.document_type.value}_photo")
            else:
                next_steps.append("All documents submitted - awaiting final approval")
        elif profile.kyc_status == KYCStatus.VERIFIED:
            next_steps.append("KYC complete - Digital ID is active")
        elif profile.kyc_status == KYCStatus.REJECTED:
            next_steps.append("Resubmit required documents")
            next_steps.append("Contact support for assistance")
        
        return KYCStatusResponse(
            success=True,
            message="KYC status retrieved successfully",
            tourist_id=tourist_id,
            kyc_status=profile.kyc_status.value,
            verification_progress=verification_progress,
            blockchain_id=profile.blockchain_id,
            digital_id_valid_until=profile.digital_id_valid_until.isoformat() if profile.digital_id_valid_until else None,
            next_steps=next_steps,
            required_documents=required_documents
        )
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving KYC status: {str(e)}"
        )

@kyc_router.post("/verify/{tourist_id}")
async def verify_tourist_kyc(
    tourist_id: int,
    verification_status: str = Form(...),
    verification_notes: Optional[str] = Form(None),
    current_user: User = Depends(require_role("tourism_authority")),
    db: Session = Depends(get_db)
):
    """Verify tourist KYC (Tourism Authority only)"""
    try:
        profile = db.query(TouristProfile).filter(
            TouristProfile.id == tourist_id
        ).first()
        
        if not profile:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Tourist profile not found"
            )
        
        # Validate verification status
        try:
            new_status = KYCStatus(verification_status)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid verification status"
            )
        
        # Update profile
        profile.kyc_status = new_status
        
        if new_status == KYCStatus.VERIFIED:
            profile.kyc_verified_at = datetime.now()
            profile.kyc_verified_by = current_user.email
            profile.aadhaar_verified = True
            profile.passport_verified = True
            
            # Activate digital ID
            profile.digital_id_status = "active"
        elif new_status == KYCStatus.REJECTED:
            profile.digital_id_status = "suspended"
        
        # Update all documents
        documents = db.query(KYCDocument).filter(
            KYCDocument.tourist_id == tourist_id
        ).all()
        
        for doc in documents:
            doc.verification_status = new_status
            if new_status == KYCStatus.VERIFIED:
                doc.verified_at = datetime.now()
                doc.verified_by = current_user.email
            doc.verification_notes = verification_notes
        
        db.commit()
        
        return {
            "success": True,
            "message": f"Tourist KYC {verification_status} successfully",
            "tourist_id": tourist_id,
            "new_status": verification_status,
            "verified_by": current_user.email
        }
    
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error verifying KYC: {str(e)}"
        )

@kyc_router.post("/verify-digital-id/{blockchain_id}")
async def verify_digital_id(
    blockchain_id: str,
    current_user: User = Depends(require_role("police")),
    db: Session = Depends(get_db)
):
    """Verify digital ID using blockchain (Police and Authorities)"""
    try:
        # Use blockchain service for verification
        verification_result = blockchain_service.verify_digital_id_with_kyc(
            blockchain_id, 
            current_user.role.value,
            {"verified_by": current_user.email}
        )
        
        if verification_result.get("success"):
            return {
                "success": True,
                "verified": verification_result.get("verified"),
                "blockchain_id": blockchain_id,
                "verification_score": verification_result.get("verification_score"),
                "kyc_status": verification_result.get("kyc_status"),
                "validity_status": verification_result.get("validity_status"),
                "personal_info": verification_result.get("personal_info"),
                "trip_info": verification_result.get("trip_info"),
                "verified_by": current_user.email,
                "verification_timestamp": datetime.now().isoformat()
            }
        else:
            return {
                "success": False,
                "verified": False,
                "error": verification_result.get("error"),
                "blockchain_id": blockchain_id
            }
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error verifying digital ID: {str(e)}"
        )