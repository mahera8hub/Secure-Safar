from fastapi import APIRouter, Depends, HTTPException, status, WebSocket
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
from database import get_db, get_mongo_db
from auth import get_current_user, require_role
from models import User, TouristProfile, Alert
from schemas import (
    TouristProfileCreate, TouristProfileResponse, LocationUpdate,
    ItineraryCreate, ItineraryResponse, AlertResponse,
    AnomalyDetectionRequest, AnomalyDetectionResponse
)
from ai_anomaly_detection import anomaly_model
from blockchain_tourist_id import blockchain_service
from geofencing_service import geofencing_service
from websocket_manager import ConnectionManager
import json
from datetime import datetime

router = APIRouter()
manager = ConnectionManager()

# Tourist Profile Routes
@router.post("/tourist/profile", response_model=TouristProfileResponse)
async def create_tourist_profile(
    profile_data: TouristProfileCreate,
    current_user: User = Depends(require_role("tourist")),
    db: Session = Depends(get_db)
):
    """Create tourist profile with blockchain ID"""
    try:
        # Check if profile already exists
        existing_profile = db.query(TouristProfile).filter(
            TouristProfile.user_id == current_user.id
        ).first()
        
        if existing_profile:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Tourist profile already exists"
            )
        
        # Create blockchain ID
        blockchain_data = {
            "passport_number": profile_data.passport_number,
            "full_name": current_user.full_name,
            "nationality": profile_data.nationality,
            "phone_number": profile_data.phone_number,
            "emergency_contact": profile_data.emergency_contact,
            "planned_exit_date": "2024-12-31T23:59:59",  # Default
            "kyc_verified": True
        }
        
        blockchain_result = blockchain_service.create_tourist_id(blockchain_data)
        
        # Create profile
        new_profile = TouristProfile(
            user_id=current_user.id,
            passport_number=profile_data.passport_number,
            nationality=profile_data.nationality,
            phone_number=profile_data.phone_number,
            emergency_contact=profile_data.emergency_contact,
            blockchain_id=blockchain_result.get("tourist_id") if blockchain_result.get("success") else None
        )
        
        db.add(new_profile)
        db.commit()
        db.refresh(new_profile)
        
        return TouristProfileResponse(
            id=new_profile.id,
            passport_number=new_profile.passport_number,
            nationality=new_profile.nationality,
            phone_number=new_profile.phone_number,
            emergency_contact=new_profile.emergency_contact,
            safety_score=new_profile.safety_score,
            blockchain_id=new_profile.blockchain_id
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating tourist profile: {str(e)}"
        )

@router.get("/tourist/profile", response_model=TouristProfileResponse)
async def get_tourist_profile(
    current_user: User = Depends(require_role("tourist")),
    db: Session = Depends(get_db)
):
    """Get current tourist's profile"""
    profile = db.query(TouristProfile).filter(
        TouristProfile.user_id == current_user.id
    ).first()
    
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tourist profile not found"
        )
    
    return TouristProfileResponse(
        id=profile.id,
        passport_number=profile.passport_number,
        nationality=profile.nationality,
        phone_number=profile.phone_number,
        emergency_contact=profile.emergency_contact,
        safety_score=profile.safety_score,
        current_location_lat=profile.current_location_lat,
        current_location_lng=profile.current_location_lng,
        blockchain_id=profile.blockchain_id
    )

@router.post("/tourist/location")
async def update_location(
    location: LocationUpdate,
    current_user: User = Depends(require_role("tourist")),
    db: Session = Depends(get_db)
):
    """Update tourist location and check for anomalies/geofencing"""
    try:
        # Get tourist profile
        profile = db.query(TouristProfile).filter(
            TouristProfile.user_id == current_user.id
        ).first()
        
        if not profile:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Tourist profile not found"
            )
        
        # Update location in database
        profile.current_location_lat = location.latitude
        profile.current_location_lng = location.longitude
        profile.last_location_update = datetime.now()
        db.commit()
        
        # Prepare data for anomaly detection
        tourist_data = {
            "tourist_id": profile.id,
            "latitude": location.latitude,
            "longitude": location.longitude,
            "timestamp": location.timestamp or datetime.now(),
            "last_location_update": profile.last_location_update,
            "planned_itinerary": []  # Would load from database
        }
        
        # Check for anomalies
        anomaly_result = anomaly_model.predict_anomaly(tourist_data)
        
        # Check for geofence violations
        geofence_violations = await geofencing_service.check_geofence_violations(tourist_data)
        
        # Store location in MongoDB for tracking
        mongo_db = await get_mongo_db()
        await mongo_db.location_history.insert_one({
            "tourist_id": profile.id,
            "location": {
                "type": "Point",
                "coordinates": [location.longitude, location.latitude]
            },
            "timestamp": tourist_data["timestamp"],
            "anomaly_detected": anomaly_result.get("anomaly_flag", False),
            "geofence_violations": len(geofence_violations) > 0
        })
        
        return {
            "message": "Location updated successfully",
            "anomaly_detection": anomaly_result,
            "geofence_violations": geofence_violations,
            "safety_score": profile.safety_score
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating location: {str(e)}"
        )

# Anomaly Detection Route
@router.post("/ai/anomaly-detection", response_model=AnomalyDetectionResponse)
async def detect_anomaly(
    request: AnomalyDetectionRequest,
    current_user: User = Depends(get_current_user)
):
    """AI-powered anomaly detection endpoint"""
    try:
        tourist_data = {
            "tourist_id": request.tourist_id,
            "latitude": request.latitude,
            "longitude": request.longitude,
            "timestamp": request.timestamp,
            "planned_itinerary": request.planned_itinerary or []
        }
        
        result = anomaly_model.predict_anomaly(tourist_data)
        
        return AnomalyDetectionResponse(
            tourist_id=result["tourist_id"],
            anomaly_flag=result["anomaly_flag"],
            reason=result.get("reason"),
            risk_score=result["risk_score"],
            timestamp=result["timestamp"]
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error in anomaly detection: {str(e)}"
        )

# Blockchain Routes
@router.post("/blockchain/verify-id")
async def verify_tourist_id(
    tourist_id: str,
    current_user: User = Depends(require_role("police")),
):
    """Verify tourist ID via blockchain"""
    try:
        result = blockchain_service.verify_tourist_id(tourist_id, current_user.role.value)
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error verifying tourist ID: {str(e)}"
        )

@router.get("/blockchain/tourist/{tourist_id}/history")
async def get_tourist_blockchain_history(
    tourist_id: str,
    current_user: User = Depends(require_role("tourism_authority")),
):
    """Get tourist's blockchain transaction history"""
    try:
        result = blockchain_service.get_tourist_history(tourist_id)
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving blockchain history: {str(e)}"
        )

# Geofencing Routes
@router.get("/geofence/zones")
async def get_geofence_zones(
    current_user: User = Depends(get_current_user)
):
    """Get all geofence zones"""
    try:
        zones = geofencing_service.get_all_zones()
        return {"zones": zones}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving geofence zones: {str(e)}"
        )

@router.get("/geofence/zones/nearby")
async def get_nearby_zones(
    lat: float,
    lng: float,
    radius: float = 5.0,
    current_user: User = Depends(get_current_user)
):
    """Get geofence zones near a location"""
    try:
        zones = geofencing_service.get_zones_near_location(lat, lng, radius)
        return {"nearby_zones": zones}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving nearby zones: {str(e)}"
        )

@router.post("/geofence/zones")
async def create_geofence_zone(
    zone_data: dict,
    current_user: User = Depends(require_role("tourism_authority"))
):
    """Create a new geofence zone"""
    try:
        result = geofencing_service.add_geofence_zone(zone_data)
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating geofence zone: {str(e)}"
        )

# Panic Button Route
@router.post("/emergency/panic")
async def trigger_panic_button(
    current_user: User = Depends(require_role("tourist")),
    db: Session = Depends(get_db)
):
    """Trigger emergency panic button"""
    try:
        # Get tourist profile
        profile = db.query(TouristProfile).filter(
            TouristProfile.user_id == current_user.id
        ).first()
        
        if not profile:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Tourist profile not found"
            )
        
        # Create emergency alert
        emergency_alert = Alert(
            tourist_id=profile.id,
            alert_type="panic",
            message=f"EMERGENCY: Panic button activated by {current_user.full_name}",
            severity="critical",
            location_lat=profile.current_location_lat,
            location_lng=profile.current_location_lng
        )
        
        db.add(emergency_alert)
        db.commit()
        
        # Send real-time alert to police
        alert_data = {
            "type": "emergency_panic",
            "tourist_id": profile.id,
            "tourist_name": current_user.full_name,
            "location": {
                "lat": profile.current_location_lat,
                "lng": profile.current_location_lng
            },
            "timestamp": datetime.now().isoformat(),
            "message": "EMERGENCY: Tourist has activated panic button",
            "contact": profile.emergency_contact
        }
        
        # Broadcast to all police
        await manager.broadcast_to_role(json.dumps(alert_data), "police")
        
        return {
            "message": "Emergency alert sent successfully",
            "alert_id": emergency_alert.id,
            "emergency_services_notified": True
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error triggering panic button: {str(e)}"
        )

# Police Dashboard Routes
@router.get("/police/dashboard/alerts")
async def get_police_alerts(
    current_user: User = Depends(require_role("police")),
    db: Session = Depends(get_db)
):
    """Get all active alerts for police dashboard"""
    try:
        alerts = db.query(Alert).filter(
            Alert.is_resolved == False
        ).order_by(Alert.created_at.desc()).limit(50).all()
        
        alert_list = []
        for alert in alerts:
            alert_list.append({
                "id": alert.id,
                "tourist_id": alert.tourist_id,
                "alert_type": alert.alert_type,
                "message": alert.message,
                "severity": alert.severity,
                "location": {
                    "lat": alert.location_lat,
                    "lng": alert.location_lng
                },
                "created_at": alert.created_at,
                "is_resolved": alert.is_resolved
            })
        
        return {"alerts": alert_list}
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving police alerts: {str(e)}"
        )

@router.get("/police/dashboard/tourist-clusters")
async def get_tourist_clusters(
    current_user: User = Depends(require_role("police")),
    db: Session = Depends(get_db)
):
    """Get real-time tourist location clusters for police dashboard"""
    try:
        # Get all active tourists with recent locations
        from datetime import datetime, timedelta
        recent_time = datetime.now() - timedelta(hours=1)
        
        tourists = db.query(TouristProfile).filter(
            TouristProfile.last_location_update >= recent_time,
            TouristProfile.current_location_lat.isnot(None),
            TouristProfile.current_location_lng.isnot(None)
        ).all()
        
        tourist_locations = []
        for tourist in tourists:
            tourist_locations.append({
                "tourist_id": tourist.id,
                "location": {
                    "lat": tourist.current_location_lat,
                    "lng": tourist.current_location_lng
                },
                "last_update": tourist.last_location_update,
                "safety_score": tourist.safety_score
            })
        
        return {"tourist_locations": tourist_locations}
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving tourist clusters: {str(e)}"
        )

# Tourism Department Dashboard Routes
@router.get("/tourism/dashboard/stats")
async def get_tourism_stats(
    current_user: User = Depends(require_role("tourism_authority")),
    db: Session = Depends(get_db)
):
    """Get comprehensive tourism statistics for department dashboard"""
    try:
        from datetime import datetime, timedelta
        
        # Calculate various statistics
        total_tourists = db.query(TouristProfile).count()
        
        # Active tourists (updated within last 24 hours)
        recent_time = datetime.now() - timedelta(hours=24)
        active_tourists = db.query(TouristProfile).filter(
            TouristProfile.last_location_update >= recent_time
        ).count()
        
        # High risk tourists (safety score < 70)
        high_risk_tourists = db.query(TouristProfile).filter(
            TouristProfile.safety_score < 70
        ).count()
        
        # Safe tourists (safety score >= 80)
        safe_tourists = db.query(TouristProfile).filter(
            TouristProfile.safety_score >= 80
        ).count()
        
        # Today's arrivals and departures (mock data for now)
        today = datetime.now().date()
        new_arrivals_today = db.query(TouristProfile).filter(
            TouristProfile.created_at >= today
        ).count()
        
        # KYC pending count
        kyc_pending = db.query(TouristProfile).filter(
            TouristProfile.kyc_status == "pending"
        ).count()
        
        # Calculate average safety score
        avg_safety_result = db.query(func.avg(TouristProfile.safety_score)).scalar()
        avg_safety_score = float(avg_safety_result) if avg_safety_result else 0.0
        
        return {
            "total_tourists": total_tourists,
            "active_tourists": active_tourists,
            "high_risk_tourists": high_risk_tourists,
            "safe_tourists": safe_tourists,
            "new_arrivals_today": new_arrivals_today,
            "departures_today": 0,  # Mock data
            "avg_safety_score": avg_safety_score,
            "kyc_pending": kyc_pending
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving tourism statistics: {str(e)}"
        )

@router.get("/tourism/dashboard/location-stats")
async def get_location_stats(
    current_user: User = Depends(require_role("tourism_authority")),
    db: Session = Depends(get_db)
):
    """Get location-based statistics for tourism dashboard"""
    try:
        # Mock location statistics - in real implementation, this would analyze tourist locations
        location_stats = [
            {
                "location": "India Gate",
                "tourist_count": 245,
                "safety_level": "high",
                "alert_count": 2,
                "last_incident": "2024-01-19T14:30:00Z"
            },
            {
                "location": "Red Fort",
                "tourist_count": 189,
                "safety_level": "medium",
                "alert_count": 5,
                "last_incident": "2024-01-20T09:15:00Z"
            },
            {
                "location": "Qutub Minar",
                "tourist_count": 134,
                "safety_level": "high",
                "alert_count": 1,
                "last_incident": "2024-01-18T16:45:00Z"
            },
            {
                "location": "Lotus Temple",
                "tourist_count": 298,
                "safety_level": "high",
                "alert_count": 0,
                "last_incident": "2024-01-17T11:20:00Z"
            },
            {
                "location": "Humayun's Tomb",
                "tourist_count": 167,
                "safety_level": "medium",
                "alert_count": 3,
                "last_incident": "2024-01-20T08:30:00Z"
            }
        ]
        
        return {"location_stats": location_stats}
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving location statistics: {str(e)}"
        )

@router.get("/tourism/dashboard/tourist-flow")
async def get_tourist_flow(
    current_user: User = Depends(require_role("tourism_authority")),
    db: Session = Depends(get_db)
):
    """Get tourist flow data for entry/exit points"""
    try:
        # Mock tourist flow data - in real implementation, this would track entry/exit points
        tourist_flow = [
            {
                "entry_point": "IGI Airport Terminal 1",
                "arrivals_today": 89,
                "departures_today": 45,
                "current_capacity": 134,
                "max_capacity": 500
            },
            {
                "entry_point": "IGI Airport Terminal 3",
                "arrivals_today": 156,
                "departures_today": 78,
                "current_capacity": 234,
                "max_capacity": 800
            },
            {
                "entry_point": "New Delhi Railway Station",
                "arrivals_today": 67,
                "departures_today": 34,
                "current_capacity": 101,
                "max_capacity": 300
            },
            {
                "entry_point": "Online Check-in",
                "arrivals_today": 45,
                "departures_today": 12,
                "current_capacity": 33,
                "max_capacity": 200
            }
        ]
        
        return {"tourist_flow": tourist_flow}
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving tourist flow data: {str(e)}"
        )

# E-FIR Generation Route
@router.post("/police/generate-efir")
async def generate_efir(
    efir_data: dict,
    current_user: User = Depends(require_role("police")),
    db: Session = Depends(get_db)
):
    """Generate E-FIR report for missing person cases"""
    try:
        # In real implementation, this would:
        # 1. Validate the E-FIR data
        # 2. Generate a formal report
        # 3. Store in database
        # 4. Notify relevant authorities
        # 5. Send to external systems (police database, etc.)
        
        report_id = f"EFIR{datetime.now().strftime('%Y%m%d%H%M%S')}"
        
        # Create alert for missing person
        missing_person_alert = Alert(
            tourist_id=efir_data.get("tourist_id"),
            alert_type="missing_person",
            message=f"E-FIR generated: {efir_data.get('incident_description', 'Missing person report')}",
            severity="critical",
            location_lat=efir_data.get("last_known_location", {}).get("lat"),
            location_lng=efir_data.get("last_known_location", {}).get("lng"),
            metadata_info={
                "efir_id": report_id,
                "reported_by": efir_data.get("reported_by"),
                "reporter_contact": efir_data.get("reporter_contact"),
                "priority_level": efir_data.get("priority_level", "high")
            }
        )
        
        db.add(missing_person_alert)
        db.commit()
        
        # In real implementation, would also:
        # - Generate PDF report
        # - Send SMS/email notifications
        # - Update blockchain records
        # - Notify emergency services
        
        return {
            "success": True,
            "report_id": report_id,
            "message": "E-FIR generated successfully",
            "alert_id": missing_person_alert.id,
            "next_steps": [
                "Investigation team has been notified",
                "Search and rescue operations initiated",
                "Local authorities have been alerted",
                "Tourist's emergency contacts will be notified"
            ]
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating E-FIR: {str(e)}"
        )

@router.get("/tourism/dashboard/digital-id-records")
async def get_digital_id_records(
    current_user: User = Depends(require_role("tourism_authority")),
    db: Session = Depends(get_db)
):
    """Get digital ID records for tourism authority"""
    try:
        # Get tourists with their digital ID information
        tourists = db.query(TouristProfile).filter(
            TouristProfile.blockchain_id.isnot(None)
        ).all()
        
        digital_records = []
        for tourist in tourists:
            user = db.query(User).filter(User.id == tourist.user_id).first()
            digital_records.append({
                "tourist_id": tourist.id,
                "name": user.full_name if user else "Unknown",
                "passport_number": tourist.passport_number,
                "nationality": tourist.nationality,
                "blockchain_id": tourist.blockchain_id,
                "kyc_status": tourist.kyc_status.value if tourist.kyc_status else "pending",
                "safety_score": tourist.safety_score,
                "digital_id_status": tourist.digital_id_status,
                "created_at": tourist.created_at,
                "last_location_update": tourist.last_location_update
            })
        
        return {"digital_id_records": digital_records}
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving digital ID records: {str(e)}"
        )