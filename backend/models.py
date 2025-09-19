from sqlalchemy import Column, Integer, String, Boolean, DateTime, Float, Text, ForeignKey, Enum, JSON
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Float, Text, ForeignKey, Enum, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from passlib.context import CryptContext
import enum

Base = declarative_base()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class UserRole(enum.Enum):
    TOURIST = "tourist"
    POLICE = "police"
    TOURISM_AUTHORITY = "tourism_authority"

class KYCStatus(enum.Enum):
    PENDING = "pending"
    UNDER_REVIEW = "under_review"
    VERIFIED = "verified"
    REJECTED = "rejected"
    EXPIRED = "expired"

class DocumentType(enum.Enum):
    AADHAAR = "aadhaar"
    PASSPORT = "passport"
    VISA = "visa"
    DRIVING_LICENSE = "driving_license"

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, unique=True, index=True, nullable=False)
    full_name = Column(String, nullable=True)
    hashed_password = Column(String, nullable=False)
    role = Column(Enum(UserRole), nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    tourist_profile = relationship("TouristProfile", back_populates="user", uselist=False)
    police_profile = relationship("PoliceProfile", back_populates="user", uselist=False)
    
    def set_password(self, password: str):
        self.hashed_password = pwd_context.hash(password)
    
    def verify_password(self, password: str):
        return pwd_context.verify(password, self.hashed_password)

class TouristProfile(Base):
    __tablename__ = "tourist_profiles"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    
    # Basic Information
    passport_number = Column(String, unique=True, nullable=True)
    nationality = Column(String, nullable=True)
    date_of_birth = Column(DateTime, nullable=True)
    phone_number = Column(String, nullable=True)
    emergency_contact = Column(String, nullable=True)
    emergency_contact_relation = Column(String, nullable=True)
    
    # KYC Information
    kyc_status = Column(Enum(KYCStatus), default=KYCStatus.PENDING)
    aadhaar_number = Column(String, nullable=True)
    aadhaar_verified = Column(Boolean, default=False)
    passport_verified = Column(Boolean, default=False)
    kyc_verified_at = Column(DateTime(timezone=True), nullable=True)
    kyc_verified_by = Column(String, nullable=True)
    
    # Trip Information
    planned_entry_date = Column(DateTime(timezone=True), nullable=True)
    planned_exit_date = Column(DateTime(timezone=True), nullable=True)
    actual_entry_date = Column(DateTime(timezone=True), nullable=True)
    entry_point = Column(String, nullable=True)  # Airport, hotel, check-post
    purpose_of_visit = Column(String, nullable=True)
    accommodation_details = Column(Text, nullable=True)  # JSON string
    
    # Location and Safety
    safety_score = Column(Float, default=100.0)
    current_location_lat = Column(Float, nullable=True)
    current_location_lng = Column(Float, nullable=True)
    last_location_update = Column(DateTime(timezone=True), nullable=True)
    
    # Blockchain Integration
    blockchain_id = Column(String, unique=True, nullable=True)
    blockchain_transaction_hash = Column(String, nullable=True)
    digital_id_valid_until = Column(DateTime(timezone=True), nullable=True)
    digital_id_status = Column(String, default="active")  # active, expired, revoked
    
    # Audit Fields
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="tourist_profile")
    itineraries = relationship("Itinerary", back_populates="tourist")
    kyc_documents = relationship("KYCDocument", back_populates="tourist")

class PoliceProfile(Base):
    __tablename__ = "police_profiles"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    badge_number = Column(String, unique=True, nullable=False)
    department = Column(String, nullable=True)
    jurisdiction_area = Column(Text, nullable=True)  # JSON string of polygon coordinates
    
    # Relationships
    user = relationship("User", back_populates="police_profile")

class Itinerary(Base):
    __tablename__ = "itineraries"
    
    id = Column(Integer, primary_key=True, index=True)
    tourist_id = Column(Integer, ForeignKey("tourist_profiles.id"))
    title = Column(String, nullable=False)
    start_date = Column(DateTime(timezone=True), nullable=False)
    end_date = Column(DateTime(timezone=True), nullable=False)
    planned_locations = Column(Text, nullable=True)  # JSON string of locations
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    tourist = relationship("TouristProfile", back_populates="itineraries")

class Alert(Base):
    __tablename__ = "alerts"
    
    id = Column(Integer, primary_key=True, index=True)
    tourist_id = Column(Integer, ForeignKey("tourist_profiles.id"))
    alert_type = Column(String, nullable=False)  # anomaly, geofence, panic, kyc_expired
    message = Column(Text, nullable=False)
    severity = Column(String, default="medium")  # low, medium, high, critical
    location_lat = Column(Float, nullable=True)
    location_lng = Column(Float, nullable=True)
    is_resolved = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    resolved_at = Column(DateTime(timezone=True), nullable=True)
    metadata_info = Column(JSON, nullable=True)  # Additional alert data

class KYCDocument(Base):
    __tablename__ = "kyc_documents"
    
    id = Column(Integer, primary_key=True, index=True)
    tourist_id = Column(Integer, ForeignKey("tourist_profiles.id"))
    document_type = Column(Enum(DocumentType), nullable=False)
    document_number = Column(String, nullable=False)
    document_file_path = Column(String, nullable=True)
    verification_status = Column(Enum(KYCStatus), default=KYCStatus.PENDING)
    verified_at = Column(DateTime(timezone=True), nullable=True)
    verified_by = Column(String, nullable=True)
    verification_notes = Column(Text, nullable=True)
    expiry_date = Column(DateTime, nullable=True)
    issued_country = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    tourist = relationship("TouristProfile", back_populates="kyc_documents")

class DigitalIDRecord(Base):
    __tablename__ = "digital_id_records"
    
    id = Column(Integer, primary_key=True, index=True)
    tourist_id = Column(Integer, ForeignKey("tourist_profiles.id"))
    blockchain_id = Column(String, unique=True, nullable=False)
    transaction_hash = Column(String, nullable=False)
    public_key = Column(Text, nullable=False)
    private_key_hash = Column(String, nullable=False)  # Hashed for security
    issued_at = Column(DateTime(timezone=True), server_default=func.now())
    valid_from = Column(DateTime(timezone=True), nullable=False)
    valid_until = Column(DateTime(timezone=True), nullable=False)
    status = Column(String, default="active")  # active, expired, revoked
    issuing_authority = Column(String, nullable=False)
    issue_point = Column(String, nullable=False)  # Entry point where ID was issued
    revocation_reason = Column(String, nullable=True)
    revoked_at = Column(DateTime(timezone=True), nullable=True)
    metadata_info = Column(JSON, nullable=True)  # Additional blockchain metadata

class GeofenceZone(Base):
    __tablename__ = "geofence_zones"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    zone_type = Column(String, nullable=False)  # restricted, safe, emergency
    coordinates = Column(Text, nullable=False)  # JSON string of polygon coordinates
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    name = Column(String, nullable=False)
    zone_type = Column(String, nullable=False)  # restricted, safe, emergency
    coordinates = Column(Text, nullable=False)  # JSON string of polygon coordinates
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())