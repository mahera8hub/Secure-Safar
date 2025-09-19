from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn
from typing import Optional
from datetime import datetime

# Create FastAPI app
app = FastAPI(title="SecureSafar API", version="1.0.0")

# Import KYC routes
try:
    from kyc_routes import kyc_router
    app.include_router(kyc_router)
    print("KYC routes loaded successfully")
except ImportError as e:
    print(f"Warning: KYC routes not available: {e}")
    kyc_router = None

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000", 
        "http://localhost:5173", 
        "http://localhost:5174", 
        "http://localhost:5175", 
        "http://localhost:5176",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
        "http://127.0.0.1:5175",
        "http://127.0.0.1:5176"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Basic models
class UserCreate(BaseModel):
    email: str
    username: str
    password: str
    full_name: Optional[str] = None
    role: str = "tourist"

class UserResponse(BaseModel):
    id: int
    email: str
    username: str
    role: str
    full_name: Optional[str] = None
    is_active: bool = True

class Token(BaseModel):
    access_token: str
    token_type: str

# Mock user database
mock_users = {
    "tourist@securesafar.com": {
        "id": 1,
        "email": "tourist@securesafar.com",
        "username": "tourist",
        "password": "tourist123",  # In production, this would be hashed
        "role": "tourist",
        "full_name": "John Doe",
        "is_active": True
    },
    "police@securesafar.com": {
        "id": 2,
        "email": "police@securesafar.com",
        "username": "police",
        "password": "police123",
        "role": "police",
        "full_name": "Officer Smith",
        "is_active": True
    },
    "admin@securesafar.com": {
        "id": 3,
        "email": "admin@securesafar.com",
        "username": "admin",
        "password": "admin123",
        "role": "tourism_authority",
        "full_name": "Administrator",
        "is_active": True
    }
}

@app.get("/")
async def root():
    return {"message": "SecureSafar API is running", "status": "active"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "SecureSafar API"}

@app.post("/register", response_model=UserResponse)
async def register(user: UserCreate):
    # Check if user already exists
    if user.email in mock_users:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create new user
    new_id = len(mock_users) + 1
    mock_users[user.email] = {
        "id": new_id,
        "email": user.email,
        "username": user.username,
        "password": user.password,  # In production, hash this
        "role": user.role,
        "full_name": user.full_name,
        "is_active": True
    }
    
    # For tourists, create basic profile with blockchain preparation
    if user.role == "tourist":
        # This would typically create a database record
        # For now, just log that a tourist account was created
        print(f"Tourist account created for {user.email} - ready for KYC registration")
    
    return UserResponse(
        id=new_id,
        email=user.email,
        username=user.username,
        role=user.role,
        full_name=user.full_name,
        is_active=True
    )

from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
from fastapi import Depends, Header
from typing import Optional, Annotated, Union

# OAuth2 scheme for token authentication
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

@app.post("/token", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    # Find user by email
    user = mock_users.get(form_data.username)
    if not user or user["password"] != form_data.password:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # In production, create a real JWT token
    access_token = f"mock-token-{user['id']}-{user['email']}"
    return {"access_token": access_token, "token_type": "bearer"}

async def get_current_user(authorization: Annotated[Union[str, None], Header()] = None):
    if not authorization or not authorization.startswith('Bearer '):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    token = authorization.split(' ')[1]
    
    # Mock token validation - extract user ID from token
    try:
        if token.startswith('mock-token-'):
            parts = token.split('-')
            if len(parts) >= 4:
                user_id = int(parts[2])
                # Find user by ID
                for user in mock_users.values():
                    if user['id'] == user_id:
                        return user
        
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )
    except (ValueError, IndexError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token format"
        )

@app.get("/users/me", response_model=UserResponse)
async def read_users_me(current_user: dict = Depends(get_current_user)):
    return UserResponse(
        id=current_user["id"],
        email=current_user["email"],
        username=current_user["username"],
        role=current_user["role"],
        full_name=current_user["full_name"],
        is_active=current_user["is_active"]
    )

# Mock API endpoints for the frontend
@app.get("/api/tourist/profile")
async def get_tourist_profile():
    return {
        "id": 1,
        "passport_number": "US123456789",
        "nationality": "United States",
        "phone_number": "+1-555-123-4567",
        "emergency_contact": "Emergency: +1-555-987-6543",
        "safety_score": 95.0,
        "current_location_lat": 28.6139,
        "current_location_lng": 77.2090,
        "blockchain_id": "blockchain-id-123456"
    }

@app.post("/api/tourist/location")
async def update_location(location_data: dict):
    """Enhanced location update with real-time processing"""
    try:
        latitude = location_data.get('latitude')
        longitude = location_data.get('longitude')
        timestamp = location_data.get('timestamp', datetime.now().isoformat())
        
        if not latitude or not longitude:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Latitude and longitude are required"
            )
        
        # Enhanced location processing with safety checks
        location_response = {
            "message": "Location updated successfully",
            "location": {
                "latitude": latitude,
                "longitude": longitude,
                "timestamp": timestamp,
                "accuracy": location_data.get('accuracy', 'unknown')
            },
            "anomaly_detection": {
                "tourist_id": 1,
                "anomaly_flag": False,
                "reason": None,
                "risk_score": 0.1,
                "geofence_status": "safe_zone"
            },
            "geofence_violations": [],
            "safety_score": 95.0,
            "nearby_services": [
                {"type": "police", "distance": 0.8, "name": "Local Police Station"},
                {"type": "hospital", "distance": 1.2, "name": "City Hospital"},
                {"type": "tourist_info", "distance": 0.3, "name": "Tourist Information Center"}
            ],
            "alerts": []
        }
        
        # Simulate geofence check
        if latitude < 28.5 or latitude > 28.7 or longitude < 77.1 or longitude > 77.3:
            location_response["geofence_violations"].append({
                "type": "area_boundary",
                "message": "Tourist has moved outside safe tourism zone",
                "severity": "medium"
            })
            location_response["anomaly_detection"]["anomaly_flag"] = True
            location_response["anomaly_detection"]["reason"] = "Geofence violation"
            location_response["anomaly_detection"]["risk_score"] = 0.7
        
        return location_response
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating location: {str(e)}"
        )

@app.post("/api/emergency/panic")
async def trigger_panic():
    return {
        "message": "Emergency alert sent successfully",
        "alert_id": 12345,
        "emergency_services_notified": True
    }

@app.get("/api/police/dashboard/alerts")
async def get_police_alerts():
    return {
        "alerts": [
            {
                "id": 1,
                "tourist_id": 1,
                "alert_type": "panic",
                "message": "Emergency: Tourist has activated panic button",
                "severity": "critical",
                "location": {"lat": 28.6139, "lng": 77.2090},
                "created_at": "2024-01-15T10:30:00",
                "is_resolved": False
            }
        ]
    }

@app.get("/api/police/dashboard/tourist-clusters")
async def get_tourist_clusters():
    """Enhanced tourist cluster data for police map view"""
    return {
        "tourist_locations": [
            {
                "tourist_id": 1,
                "full_name": "John Smith",
                "nationality": "United States",
                "location": {"lat": 28.6139, "lng": 77.2090},
                "last_update": "2024-01-15T10:30:00",
                "safety_score": 95.0,
                "status": "active",
                "verification_level": "premium",
                "blockchain_id": "block_001",
                "phone_number": "+1-555-123-4567",
                "emergency_contact": "+1-555-987-6543"
            },
            {
                "tourist_id": 2,
                "full_name": "Maria Garcia",
                "nationality": "Spain",
                "location": {"lat": 28.6150, "lng": 77.2100},
                "last_update": "2024-01-15T10:29:00",
                "safety_score": 88.0,
                "status": "active",
                "verification_level": "enhanced",
                "blockchain_id": "block_002",
                "phone_number": "+34-666-123-456"
            },
            {
                "tourist_id": 3,
                "full_name": "Akira Tanaka",
                "nationality": "Japan",
                "location": {"lat": 28.6145, "lng": 77.2085},
                "last_update": "2024-01-15T10:25:00",
                "safety_score": 92.0,
                "status": "alert",
                "verification_level": "standard",
                "blockchain_id": "block_003"
            },
            {
                "tourist_id": 4,
                "full_name": "Sarah Johnson",
                "nationality": "United Kingdom", 
                "location": {"lat": 28.6155, "lng": 77.2075},
                "last_update": "2024-01-15T09:45:00",
                "safety_score": 65.0,
                "status": "emergency",
                "verification_level": "premium",
                "blockchain_id": "block_004",
                "phone_number": "+44-7700-123456",
                "emergency_contact": "+44-7700-987654"
            }
        ],
        "clusters": [
            {
                "id": "cluster_1",
                "center": {"lat": 28.6139, "lng": 77.2090},
                "tourist_count": 3,
                "risk_level": "low",
                "last_update": "2024-01-15T10:30:00"
            },
            {
                "id": "cluster_2", 
                "center": {"lat": 28.6155, "lng": 77.2075},
                "tourist_count": 1,
                "risk_level": "critical",
                "last_update": "2024-01-15T09:45:00"
            }
        ],
        "summary": {
            "total_tourists": 4,
            "active_tourists": 2,
            "alerts": 1,
            "emergencies": 1,
            "offline_tourists": 0
        }
    }

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)