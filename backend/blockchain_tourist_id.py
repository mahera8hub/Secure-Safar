# Commented out for demo - would use actual Hyperledger Fabric in production
# from hfc.api import HfcApi
import asyncio
import json
import uuid
from datetime import datetime, timedelta
from typing import Dict, Optional
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.asymmetric import rsa
from cryptography.hazmat.primitives import serialization
import base64
import os

class BlockchainTouristID:
    def __init__(self):
        self.api = None
        self.channel_name = "tourism-channel"
        self.chaincode_name = "tourist-id-cc"
        self.org_name = "TourismOrg"
        self.user_name = "admin"
        self.peer_name = "peer0.tourism.example.com"
        self.orderer_name = "orderer.example.com"
        
        # Initialize connection (in production, you would have proper network configuration)
        self.initialize_network()
    
    def initialize_network(self):
        """Initialize Hyperledger Fabric network connection"""
        try:
            # In a real implementation, you would have proper network configuration
            # For demo purposes, we'll simulate the blockchain operations
            # self.api = HfcApi()
            self.api = None  # Using simulation mode
            print("Blockchain network initialized (simulation mode)")
        except Exception as e:
            print(f"Blockchain initialization error (using simulation): {e}")
            self.api = None
    
    def generate_key_pair(self) -> Dict[str, str]:
        """Generate RSA key pair for tourist ID"""
        private_key = rsa.generate_private_key(
            public_exponent=65537,
            key_size=2048,
        )
        
        private_pem = private_key.private_bytes(
            encoding=serialization.Encoding.PEM,
            format=serialization.PrivateFormat.PKCS8,
            encryption_algorithm=serialization.NoEncryption()
        )
        
        public_key = private_key.public_key()
        public_pem = public_key.public_bytes(
            encoding=serialization.Encoding.PEM,
            format=serialization.PublicFormat.SubjectPublicKeyInfo
        )
        
        return {
            "private_key": base64.b64encode(private_pem).decode(),
            "public_key": base64.b64encode(public_pem).decode()
        }
    
    def create_tourist_id(self, tourist_data: Dict, kyc_data: Dict = None) -> Dict:
        """Create a new digital tourist ID on the blockchain with enhanced KYC and Aadhar integration"""
        try:
            # Generate unique ID
            tourist_id = str(uuid.uuid4())
            
            # Generate key pair for digital signature
            keys = self.generate_key_pair()
            
            # Enhanced ID record with comprehensive KYC and Aadhar data
            id_record = {
                "tourist_id": tourist_id,
                
                # Core Identity Information (from KYC/Aadhar)
                "full_name": kyc_data.get("full_name") if kyc_data else tourist_data.get("full_name"),
                "date_of_birth": kyc_data.get("date_of_birth") if kyc_data else tourist_data.get("date_of_birth"),
                "nationality": kyc_data.get("nationality") if kyc_data else tourist_data.get("nationality"),
                "gender": kyc_data.get("gender") if kyc_data else tourist_data.get("gender"),
                
                # Government Document Integration
                "passport_number": kyc_data.get("passport_number") if kyc_data else tourist_data.get("passport_number"),
                "passport_verified": kyc_data.get("passport_verified", False),
                "passport_expiry_date": kyc_data.get("passport_expiry_date") if kyc_data else None,
                
                # Aadhar Integration (for Indian citizens and eligible foreigners)
                "aadhaar_number": kyc_data.get("aadhaar_number") if kyc_data else tourist_data.get("aadhaar_number"),
                "aadhaar_verified": kyc_data.get("aadhaar_verified", False),
                "aadhaar_name_match": kyc_data.get("aadhaar_name_match", False),
                "aadhaar_biometric_verified": kyc_data.get("aadhaar_biometric_verified", False),
                "uidai_verification_timestamp": kyc_data.get("uidai_verification_timestamp") if kyc_data else None,
                
                # Contact Information
                "phone_number": kyc_data.get("phone_number") if kyc_data else tourist_data.get("phone_number"),
                "email": kyc_data.get("email") if kyc_data else tourist_data.get("email"),
                "address": kyc_data.get("address") if kyc_data else tourist_data.get("address"),
                
                # Emergency Contacts
                "emergency_contact": kyc_data.get("emergency_contact") if kyc_data else tourist_data.get("emergency_contact"),
                "emergency_contact_relation": kyc_data.get("emergency_contact_relation") if kyc_data else tourist_data.get("emergency_contact_relation"),
                
                # Trip Information
                "planned_entry_date": kyc_data.get("planned_entry_date") if kyc_data else tourist_data.get("planned_entry_date"),
                "planned_exit_date": kyc_data.get("planned_exit_date") if kyc_data else tourist_data.get("planned_exit_date"),
                "entry_point": kyc_data.get("entry_point") if kyc_data else tourist_data.get("entry_point"),
                "purpose_of_visit": kyc_data.get("purpose_of_visit") if kyc_data else tourist_data.get("purpose_of_visit"),
                "accommodation_details": kyc_data.get("accommodation_details") if kyc_data else tourist_data.get("accommodation_details"),
                "planned_itinerary": kyc_data.get("planned_itinerary") if kyc_data else tourist_data.get("planned_itinerary"),
                
                # Verification and Security Levels
                "kyc_verified": kyc_data is not None,
                "verification_level": self.calculate_verification_level(kyc_data, tourist_data),
                "risk_assessment": self.assess_risk_level(kyc_data, tourist_data),
                "verification_timestamp": datetime.now().isoformat(),
                
                # Blockchain and Digital ID Metadata
                "public_key": keys["public_key"],
                "issued_at": datetime.now().isoformat(),
                "expires_at": kyc_data.get("planned_exit_date") if kyc_data else tourist_data.get("planned_exit_date"),
                "status": "active",
                "created_by": "tourism_authority",
                "issuing_point": kyc_data.get("entry_point") if kyc_data else "online_registration",
                
                # Compliance and Legal
                "gdpr_consent": kyc_data.get("gdpr_consent", True) if kyc_data else True,
                "data_retention_period": kyc_data.get("data_retention_period") if kyc_data else "trip_duration_plus_5_years",
                "privacy_level": kyc_data.get("privacy_level", "standard") if kyc_data else "basic",
                
                # Additional Security Features
                "biometric_template_hash": kyc_data.get("biometric_template_hash") if kyc_data else None,
                "facial_recognition_template": kyc_data.get("facial_recognition_template") if kyc_data else None,
                "travel_insurance_number": kyc_data.get("travel_insurance_number") if kyc_data else None,
                "special_requirements": kyc_data.get("special_requirements") if kyc_data else None,
                "medical_conditions_declared": kyc_data.get("medical_conditions_declared", False) if kyc_data else False,
                
                # Audit Trail
                "creation_ip_address": kyc_data.get("creation_ip_address") if kyc_data else None,
                "creation_device_fingerprint": kyc_data.get("creation_device_fingerprint") if kyc_data else None,
                "verification_source": "kyc_registration" if kyc_data else "basic_registration"
            }
            
            # In a real implementation, this would invoke chaincode
            if self.api:
                # Simulated blockchain operation
                transaction_id = self.invoke_chaincode("createTouristID", [json.dumps(id_record)])
            else:
                # Fallback simulation
                transaction_id = f"tx_{uuid.uuid4()}"
            
            # Generate comprehensive QR code data for digital ID
            qr_data = {
                "tourist_id": tourist_id,
                "full_name": id_record["full_name"],
                "nationality": id_record["nationality"],
                "passport_number": id_record["passport_number"],
                "aadhaar_verified": id_record["aadhaar_verified"],
                "verification_level": id_record["verification_level"],
                "expires_at": id_record["expires_at"],
                "verification_url": f"https://securesafar.gov/verify/{tourist_id}",
                "issued_at": id_record["issued_at"],
                "qr_version": "2.0",
                "security_hash": self.generate_security_hash(tourist_id, id_record)
            }
            
            return {
                "success": True,
                "tourist_id": tourist_id,
                "transaction_id": transaction_id,
                "blockchain_address": f"blockchain://{self.channel_name}/{tourist_id}",
                "private_key": keys["private_key"],  # Should be securely stored
                "public_key": keys["public_key"],
                "qr_code_data": json.dumps(qr_data),
                "digital_id_expires_at": id_record["expires_at"],
                "verification_level": id_record["verification_level"],
                "aadhaar_integrated": bool(id_record.get("aadhaar_number")),
                "risk_level": id_record["risk_assessment"],
                "record": id_record
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "tourist_id": None
            }
    
    def verify_tourist_id(self, tourist_id: str, requester_role: str) -> Dict:
        """Verify a tourist ID from the blockchain"""
        try:
            if not self.has_verification_permission(requester_role):
                return {
                    "success": False,
                    "error": "Insufficient permissions to verify tourist ID",
                    "verified": False
                }
            
            # In a real implementation, this would query the chaincode
            if self.api:
                # Simulated blockchain query
                result = self.query_chaincode("getTouristID", [tourist_id])
            else:
                # Fallback simulation
                result = self.simulate_tourist_lookup(tourist_id)
            
            if result:
                record = json.loads(result) if isinstance(result, str) else result
                
                # Check if ID is still valid
                expires_at = datetime.fromisoformat(record.get("expires_at", ""))
                is_expired = datetime.now() > expires_at
                
                return {
                    "success": True,
                    "verified": True,
                    "tourist_id": tourist_id,
                    "record": {
                        "full_name": record.get("full_name"),
                        "nationality": record.get("nationality"),
                        "status": "expired" if is_expired else record.get("status"),
                        "entry_date": record.get("entry_date"),
                        "expires_at": record.get("expires_at"),
                        "kyc_verified": record.get("kyc_verified"),
                        "is_expired": is_expired
                    },
                    "blockchain_verified": True
                }
            else:
                return {
                    "success": True,
                    "verified": False,
                    "error": "Tourist ID not found on blockchain",
                    "tourist_id": tourist_id
                }
                
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "verified": False
            }
    
    def update_tourist_status(self, tourist_id: str, new_status: str, updated_by: str) -> Dict:
        """Update tourist ID status on the blockchain"""
        try:
            update_data = {
                "tourist_id": tourist_id,
                "status": new_status,
                "updated_by": updated_by,
                "updated_at": datetime.now().isoformat()
            }
            
            if self.api:
                transaction_id = self.invoke_chaincode("updateTouristStatus", [json.dumps(update_data)])
            else:
                transaction_id = f"tx_update_{uuid.uuid4()}"
            
            return {
                "success": True,
                "transaction_id": transaction_id,
                "updated_status": new_status
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }
    
    def expire_tourist_id(self, tourist_id: str) -> Dict:
        """Mark a tourist ID as expired"""
        return self.update_tourist_status(tourist_id, "expired", "system_auto_expire")
    
    def revoke_tourist_id(self, tourist_id: str, reason: str, revoked_by: str) -> Dict:
        """Revoke a tourist ID"""
        try:
            revocation_data = {
                "tourist_id": tourist_id,
                "status": "revoked",
                "reason": reason,
                "revoked_by": revoked_by,
                "revoked_at": datetime.now().isoformat()
            }
            
            if self.api:
                transaction_id = self.invoke_chaincode("revokeTouristID", [json.dumps(revocation_data)])
            else:
                transaction_id = f"tx_revoke_{uuid.uuid4()}"
            
            return {
                "success": True,
                "transaction_id": transaction_id,
                "status": "revoked"
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }
    
    def get_tourist_history(self, tourist_id: str) -> Dict:
        """Get the complete transaction history for a tourist ID"""
        try:
            if self.api:
                result = self.query_chaincode("getTouristHistory", [tourist_id])
            else:
                result = self.simulate_tourist_history(tourist_id)
            
            return {
                "success": True,
                "tourist_id": tourist_id,
                "history": result
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "history": []
            }
    
    def validate_kyc_eligibility(self, kyc_data: Dict) -> Dict:
        """Validate if tourist is eligible for digital ID based on KYC data"""
        try:
            validation_errors = []
            
            # Required fields validation
            required_fields = [
                "full_name", "date_of_birth", "nationality", "document_type",
                "document_number", "phone_number", "email", "emergency_contact_name",
                "emergency_contact_phone", "entry_date", "planned_exit_date", "trip_purpose"
            ]
            
            for field in required_fields:
                if not kyc_data.get(field):
                    validation_errors.append(f"Missing required field: {field}")
            
            # Date validations
            try:
                entry_date = datetime.fromisoformat(kyc_data.get("entry_date", ""))
                exit_date = datetime.fromisoformat(kyc_data.get("planned_exit_date", ""))
                
                if entry_date >= exit_date:
                    validation_errors.append("Entry date must be before planned exit date")
                
                if exit_date <= datetime.now():
                    validation_errors.append("Planned exit date must be in the future")
                    
                # Check if trip duration is reasonable (max 180 days for tourists)
                trip_duration = (exit_date - entry_date).days
                if trip_duration > 180:
                    validation_errors.append("Trip duration exceeds maximum allowed period (180 days)")
                    
            except ValueError:
                validation_errors.append("Invalid date format. Use YYYY-MM-DD format")
            
            return {
                "eligible": len(validation_errors) == 0,
                "validation_errors": validation_errors,
                "risk_level": "low",
                "verification_requirements": ["passport_photo", "accommodation_proof"]
            }
            
        except Exception as e:
            return {
                "eligible": False,
                "validation_errors": [f"Validation error: {str(e)}"],
                "risk_level": "high",
                "verification_requirements": []
            }

    def calculate_verification_level(self, kyc_data: Dict, tourist_data: Dict) -> str:
        """Calculate verification level based on available data and documents"""
        if not kyc_data:
            return "basic"
        
        level_score = 0
        
        # Core KYC completion
        if kyc_data.get("full_name") and kyc_data.get("date_of_birth"):
            level_score += 20
        
        # Passport verification
        if kyc_data.get("passport_number") and kyc_data.get("passport_verified"):
            level_score += 30
        
        # Aadhar verification (additional security for eligible individuals)
        if kyc_data.get("aadhaar_number") and kyc_data.get("aadhaar_verified"):
            level_score += 25
        
        # Biometric verification
        if kyc_data.get("aadhaar_biometric_verified") or kyc_data.get("biometric_template_hash"):
            level_score += 15
        
        # Contact verification
        if kyc_data.get("phone_number") and kyc_data.get("email"):
            level_score += 10
        
        if level_score >= 80:
            return "premium"
        elif level_score >= 60:
            return "enhanced"
        elif level_score >= 40:
            return "standard"
        else:
            return "basic"
    
    def assess_risk_level(self, kyc_data: Dict, tourist_data: Dict) -> str:
        """Assess risk level based on available information"""
        risk_score = 0
        
        if not kyc_data:
            return "medium"
        
        # Higher verification = lower risk
        verification_level = self.calculate_verification_level(kyc_data, tourist_data)
        if verification_level == "premium":
            risk_score -= 30
        elif verification_level == "enhanced":
            risk_score -= 20
        elif verification_level == "standard":
            risk_score -= 10
        
        # Aadhar verification significantly reduces risk for Indian system
        if kyc_data.get("aadhaar_verified") and kyc_data.get("aadhaar_biometric_verified"):
            risk_score -= 25
        
        # Complete documentation
        if kyc_data.get("passport_verified") and kyc_data.get("travel_insurance_number"):
            risk_score -= 15
        
        # Emergency contacts and accommodation
        if kyc_data.get("emergency_contact") and kyc_data.get("accommodation_details"):
            risk_score -= 10
        
        # Trip duration (longer trips might need more scrutiny)
        try:
            if kyc_data.get("planned_entry_date") and kyc_data.get("planned_exit_date"):
                entry_date = datetime.fromisoformat(kyc_data["planned_entry_date"])
                exit_date = datetime.fromisoformat(kyc_data["planned_exit_date"])
                trip_duration = (exit_date - entry_date).days
                if trip_duration > 90:
                    risk_score += 15
                elif trip_duration > 180:
                    risk_score += 25
        except:
            pass
        
        if risk_score <= -40:
            return "very_low"
        elif risk_score <= -20:
            return "low"
        elif risk_score <= 10:
            return "medium"
        elif risk_score <= 30:
            return "high"
        else:
            return "very_high"
    
    def generate_security_hash(self, tourist_id: str, id_record: Dict) -> str:
        """Generate a security hash for the QR code to prevent tampering"""
        import hashlib
        
        # Create a deterministic hash from key fields
        hash_data = f"{tourist_id}{id_record.get('full_name', '')}{id_record.get('passport_number', '')}{id_record.get('issued_at', '')}"
        return hashlib.sha256(hash_data.encode()).hexdigest()[:16]
    
    def verify_digital_id_with_kyc(self, tourist_id: str, requester_role: str, verification_context: Dict = None) -> Dict:
        """Enhanced verification with KYC and Aadhar integration"""
        try:
            if not self.has_verification_permission(requester_role):
                return {
                    "success": False,
                    "error": "Insufficient permissions to verify tourist ID",
                    "verified": False
                }
            
            # Query blockchain for tourist record
            if self.api:
                result = self.query_chaincode("getTouristID", [tourist_id])
            else:
                result = self.simulate_enhanced_tourist_lookup(tourist_id)
            
            if result:
                record = json.loads(result) if isinstance(result, str) else result
                
                # Check validity
                expires_at = datetime.fromisoformat(record.get("expires_at", ""))
                is_expired = datetime.now() > expires_at
                
                # Calculate verification score
                verification_score = self.calculate_verification_score(record)
                
                # Determine what information to return based on requester role
                response_data = self.filter_response_by_role(record, requester_role)
                
                return {
                    "success": True,
                    "verified": True,
                    "tourist_id": tourist_id,
                    "verification_score": verification_score,
                    "kyc_status": "verified" if record.get("kyc_verified") else "pending",
                    "aadhaar_status": "verified" if record.get("aadhaar_verified") else "not_available",
                    "validity_status": "expired" if is_expired else "valid",
                    "verification_level": record.get("verification_level", "basic"),
                    "risk_assessment": record.get("risk_assessment", "medium"),
                    "personal_info": response_data.get("personal_info"),
                    "trip_info": response_data.get("trip_info"),
                    "document_info": response_data.get("document_info"),
                    "blockchain_verified": True,
                    "last_verified_at": datetime.now().isoformat()
                }
            else:
                return {
                    "success": True,
                    "verified": False,
                    "error": "Tourist ID not found on blockchain",
                    "tourist_id": tourist_id
                }
                
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "verified": False
            }
    
    def calculate_verification_score(self, record: Dict) -> float:
        """Calculate a verification score from 0-100 based on completeness and verification status"""
        score = 0.0
        
        # Basic information (20 points)
        if record.get("full_name") and record.get("date_of_birth"):
            score += 20
        
        # Document verification (30 points)
        if record.get("passport_verified"):
            score += 20
        if record.get("aadhaar_verified"):
            score += 10
        
        # Biometric verification (20 points)
        if record.get("aadhaar_biometric_verified"):
            score += 15
        if record.get("facial_recognition_template"):
            score += 5
        
        # Contact and emergency info (15 points)
        if record.get("phone_number") and record.get("email"):
            score += 10
        if record.get("emergency_contact"):
            score += 5
        
        # Trip planning and accommodation (15 points)
        if record.get("accommodation_details"):
            score += 8
        if record.get("planned_itinerary"):
            score += 7
        
        return min(score, 100.0)
    
    def filter_response_by_role(self, record: Dict, requester_role: str) -> Dict:
        """Filter response data based on requester's role and permission level"""
        base_info = {
            "personal_info": {
                "full_name": record.get("full_name"),
                "nationality": record.get("nationality"),
                "age_verified": bool(record.get("date_of_birth"))
            },
            "trip_info": {
                "planned_entry_date": record.get("planned_entry_date"),
                "planned_exit_date": record.get("planned_exit_date"),
                "purpose_of_visit": record.get("purpose_of_visit"),
                "entry_point": record.get("entry_point")
            },
            "document_info": {
                "passport_verified": record.get("passport_verified", False),
                "aadhaar_verified": record.get("aadhaar_verified", False)
            }
        }
        
        # Police and authorities get additional information
        if requester_role.lower() in ["police", "tourism_authority", "border_control"]:
            base_info["personal_info"].update({
                "phone_number": record.get("phone_number"),
                "emergency_contact": record.get("emergency_contact")
            })
            base_info["document_info"].update({
                "passport_number": record.get("passport_number"),
                "aadhaar_last_4": record.get("aadhaar_number", "")[-4:] if record.get("aadhaar_number") else None
            })
            base_info["trip_info"].update({
                "accommodation_details": record.get("accommodation_details"),
                "planned_itinerary": record.get("planned_itinerary")
            })
        
        return base_info
    
    def simulate_enhanced_tourist_lookup(self, tourist_id: str) -> str:
        """Enhanced simulation for tourist ID lookup with Aadhar integration"""
        simulated_record = {
            "tourist_id": tourist_id,
            "full_name": "John Doe",
            "nationality": "US",
            "date_of_birth": "1985-06-15T00:00:00",
            "passport_number": "US123456789",
            "passport_verified": True,
            "aadhaar_number": "123456789012",
            "aadhaar_verified": True,
            "aadhaar_biometric_verified": True,
            "phone_number": "+1-555-123-4567",
            "email": "john.doe@example.com",
            "emergency_contact": "+1-555-987-6543",
            "emergency_contact_relation": "spouse",
            "planned_entry_date": "2024-01-15T10:00:00",
            "planned_exit_date": (datetime.now() + timedelta(days=30)).isoformat(),
            "entry_point": "Delhi International Airport",
            "purpose_of_visit": "tourism",
            "accommodation_details": '{"hotel_name": "Hotel Example", "address": "New Delhi"}',
            "planned_itinerary": '[{"date": "2024-01-16", "location": "Red Fort", "activity": "Sightseeing"}]',
            "verification_level": "premium",
            "risk_assessment": "low",
            "status": "active",
            "kyc_verified": True,
            "issued_at": "2024-01-15T10:00:00",
            "expires_at": (datetime.now() + timedelta(days=30)).isoformat()
        }
        return json.dumps(simulated_record)
    
    def has_verification_permission(self, role: str) -> bool:
        """Check if the role has permission to verify tourist IDs"""
        allowed_roles = ["police", "tourism_authority", "border_control", "emergency_services"]
        return role.lower() in allowed_roles
    
    def invoke_chaincode(self, function_name: str, args: list) -> str:
        """Invoke chaincode function (simulated)"""
        # In a real implementation, this would be:
        # return self.api.invoke_chaincode(function_name, args, self.channel_name, self.chaincode_name)
        return f"simulated_tx_{uuid.uuid4()}"
    
    def query_chaincode(self, function_name: str, args: list) -> str:
        """Query chaincode function (simulated)"""
        # In a real implementation, this would be:
        # return self.api.query_chaincode(function_name, args, self.channel_name, self.chaincode_name)
        if function_name == "getTouristID":
            return self.simulate_tourist_lookup(args[0])
        return "{}"
    
    def simulate_tourist_lookup(self, tourist_id: str) -> str:
        """Simulate tourist ID lookup for demo purposes"""
        # This is just for demonstration - in reality, data comes from blockchain
        simulated_record = {
            "tourist_id": tourist_id,
            "full_name": "John Doe",
            "nationality": "US",
            "entry_date": "2024-01-15T10:00:00",
            "expires_at": (datetime.now() + timedelta(days=30)).isoformat(),
            "status": "active",
            "kyc_verified": True
        }
        return json.dumps(simulated_record)
    
    def simulate_tourist_history(self, tourist_id: str) -> list:
        """Simulate tourist ID history for demo purposes"""
        return [
            {
                "transaction_id": f"tx_{uuid.uuid4()}",
                "action": "created",
                "timestamp": "2024-01-15T10:00:00",
                "performed_by": "tourism_authority"
            },
            {
                "transaction_id": f"tx_{uuid.uuid4()}",
                "action": "verified",
                "timestamp": "2024-01-15T12:30:00",
                "performed_by": "border_control"
            }
        ]

# Global blockchain instance
blockchain_service = BlockchainTouristID()