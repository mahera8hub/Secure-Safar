from pydantic import BaseModel, EmailStr, validator, Field
from datetime import datetime
from typing import Optional, List, Dict, Any
from models import UserRole, KYCStatus, DocumentType

class UserBase(BaseModel):
    email: EmailStr
    username: str
    full_name: Optional[str] = None
    role: UserRole

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: int
    is_active: bool
    created_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

class TouristProfileCreate(BaseModel):
    passport_number: Optional[str] = None
    nationality: Optional[str] = None
    phone_number: Optional[str] = None
    emergency_contact: Optional[str] = None

class KYCRegistrationRequest(BaseModel):
    # Basic Identity Information
    full_name: str
    date_of_birth: str  # YYYY-MM-DD format
    nationality: str
    gender: str
    
    # Document Information
    document_type: str  # "passport" or "aadhaar" or "national_id"
    document_number: str
    document_expiry_date: Optional[str] = None
    
    # Contact Information
    phone_number: str
    email: str
    emergency_contact_name: str
    emergency_contact_phone: str
    emergency_contact_relationship: str
    
    # Trip Information
    entry_date: str  # YYYY-MM-DD format
    planned_exit_date: str  # YYYY-MM-DD format
    trip_purpose: str  # "tourism", "business", "education", "medical", "other"
    accommodation_address: Optional[str] = None
    local_contact_name: Optional[str] = None
    local_contact_phone: Optional[str] = None
    
    # Itinerary
    planned_destinations: Optional[List[str]] = None
    itinerary_details: Optional[str] = None  # JSON string of detailed itinerary
    
    # Additional Information
    special_requirements: Optional[str] = None
    medical_conditions: Optional[str] = None
    travel_insurance_number: Optional[str] = None

class KYCDocumentUpload(BaseModel):
    tourist_id: int
    document_type: str  # "passport_photo", "visa", "accommodation_proof", "return_ticket"
    file_name: str
    file_size: int
    file_hash: str

class BlockchainIDResponse(BaseModel):
    success: bool
    tourist_id: Optional[str] = None
    blockchain_address: Optional[str] = None
    transaction_id: Optional[str] = None
    digital_id_qr_code: Optional[str] = None
    expires_at: Optional[str] = None
    error: Optional[str] = None

class KYCStatusResponse(BaseModel):
    kyc_status: str  # "pending", "in_review", "approved", "rejected"
    verification_level: str  # "basic", "enhanced", "full"
    documents_required: List[str]
    documents_submitted: List[str]
    blockchain_id: Optional[str] = None
    rejection_reason: Optional[str] = None
    verification_date: Optional[datetime] = None

class TouristProfileResponse(BaseModel):
    id: int
    passport_number: Optional[str] = None
    nationality: Optional[str] = None
    phone_number: Optional[str] = None
    emergency_contact: Optional[str] = None
    safety_score: float
    current_location_lat: Optional[float] = None
    current_location_lng: Optional[float] = None
    blockchain_id: Optional[str] = None
    kyc_status: Optional[str] = None
    verification_level: Optional[str] = None
    digital_id_expires_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

class EnhancedTouristProfileResponse(BaseModel):
    id: int
    # Basic Information
    full_name: str
    date_of_birth: Optional[str] = None
    nationality: Optional[str] = None
    gender: Optional[str] = None
    
    # Document Information
    document_type: Optional[str] = None
    document_number: Optional[str] = None
    document_expiry_date: Optional[str] = None
    
    # Contact Information
    phone_number: Optional[str] = None
    email: Optional[str] = None
    emergency_contact_name: Optional[str] = None
    emergency_contact_phone: Optional[str] = None
    emergency_contact_relationship: Optional[str] = None
    
    # Trip Information
    entry_date: Optional[str] = None
    planned_exit_date: Optional[str] = None
    trip_purpose: Optional[str] = None
    accommodation_address: Optional[str] = None
    
    # Verification Status
    kyc_status: str
    verification_level: str
    blockchain_id: Optional[str] = None
    digital_id_expires_at: Optional[datetime] = None
    safety_score: float
    
    # Location
    current_location_lat: Optional[float] = None
    current_location_lng: Optional[float] = None
    
    class Config:
        from_attributes = True

class LocationUpdate(BaseModel):
    latitude: float
    longitude: float
    timestamp: Optional[datetime] = None

class ItineraryCreate(BaseModel):
    title: str
    start_date: datetime
    end_date: datetime
    planned_locations: Optional[str] = None

class ItineraryResponse(BaseModel):
    id: int
    title: str
    start_date: datetime
    end_date: datetime
    planned_locations: Optional[str] = None
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

class AlertCreate(BaseModel):
    tourist_id: int
    alert_type: str
    message: str
    severity: str = "medium"
    location_lat: Optional[float] = None
    location_lng: Optional[float] = None

class AlertResponse(BaseModel):
    id: int
    tourist_id: int
    alert_type: str
    message: str
    severity: str
    location_lat: Optional[float] = None
    location_lng: Optional[float] = None
    is_resolved: bool
    created_at: datetime
    resolved_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

class GeofenceZoneCreate(BaseModel):
    name: str
    zone_type: str
    coordinates: str

class GeofenceZoneResponse(BaseModel):
    id: int
    name: str
    zone_type: str
    coordinates: str
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

class AnomalyDetectionRequest(BaseModel):
    tourist_id: int
    latitude: float
    longitude: float
    timestamp: datetime
    planned_itinerary: Optional[List[dict]] = None

class AnomalyDetectionResponse(BaseModel):
    tourist_id: int
    anomaly_flag: bool
    reason: Optional[str] = None
    risk_score: float
    timestamp: datetime