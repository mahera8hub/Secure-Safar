from typing import List, Dict, Tuple, Optional
from shapely.geometry import Point, Polygon
import json
import math
from datetime import datetime
from database import async_mongo_db, sync_mongo_db
from websocket_manager import ConnectionManager
from models import GeofenceZone, Alert

# Simple distance calculation function
def calculate_distance_km(point1: Tuple[float, float], point2: Tuple[float, float]) -> float:
    """Calculate distance between two points using haversine formula"""
    lat1, lon1 = point1
    lat2, lon2 = point2
    R = 6371  # Earth's radius in km
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat/2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon/2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
    distance = R * c
    return distance

class GeofencingService:
    def __init__(self, websocket_manager: Optional[ConnectionManager] = None):
        self.websocket_manager = websocket_manager
        self.active_zones = {}  # Cache for active geofence zones
        self.load_geofence_zones()
    
    def load_geofence_zones(self):
        """Load all active geofence zones from database"""
        try:
            # In a real implementation, load from PostgreSQL
            # For now, create some sample zones
            self.active_zones = {
                "restricted_zone_1": {
                    "id": 1,
                    "name": "Government District",
                    "type": "restricted",
                    "coordinates": [
                        [77.2090, 28.6139],  # Delhi coordinates example
                        [77.2100, 28.6139],
                        [77.2100, 28.6149],
                        [77.2090, 28.6149],
                        [77.2090, 28.6139]
                    ],
                    "polygon": None
                },
                "safe_zone_1": {
                    "id": 2,
                    "name": "Tourist Hub",
                    "type": "safe",
                    "coordinates": [
                        [77.2000, 28.6100],
                        [77.2050, 28.6100],
                        [77.2050, 28.6150],
                        [77.2000, 28.6150],
                        [77.2000, 28.6100]
                    ],
                    "polygon": None
                },
                "emergency_zone_1": {
                    "id": 3,
                    "name": "Hospital District",
                    "type": "emergency",
                    "coordinates": [
                        [77.1950, 28.6050],
                        [77.1980, 28.6050],
                        [77.1980, 28.6080],
                        [77.1950, 28.6080],
                        [77.1950, 28.6050]
                    ],
                    "polygon": None
                }
            }
            
            # Create Shapely polygons for efficient point-in-polygon testing
            for zone_id, zone in self.active_zones.items():
                coords = [(lng, lat) for lng, lat in zone["coordinates"]]
                zone["polygon"] = Polygon(coords)
            
            print(f"Loaded {len(self.active_zones)} geofence zones")
            
        except Exception as e:
            print(f"Error loading geofence zones: {e}")
            self.active_zones = {}
    
    async def check_geofence_violations(self, tourist_data: Dict) -> List[Dict]:
        """Check if tourist location violates any geofence zones"""
        violations = []
        
        try:
            lat = tourist_data.get("latitude")
            lng = tourist_data.get("longitude")
            tourist_id = tourist_data.get("tourist_id")
            
            if not lat or not lng or not tourist_id:
                return violations
            
            tourist_point = Point(lng, lat)
            
            for zone_id, zone in self.active_zones.items():
                if zone["polygon"] and zone["polygon"].contains(tourist_point):
                    violation = {
                        "tourist_id": tourist_id,
                        "zone_id": zone["id"],
                        "zone_name": zone["name"],
                        "zone_type": zone["type"],
                        "location": {"lat": lat, "lng": lng},
                        "timestamp": datetime.now().isoformat(),
                        "violation_type": self.get_violation_type(zone["type"])
                    }
                    violations.append(violation)
            
            # Process violations
            for violation in violations:
                await self.process_geofence_violation(violation)
            
        except Exception as e:
            print(f"Error checking geofence violations: {e}")
        
        return violations
    
    def get_violation_type(self, zone_type: str) -> str:
        """Determine violation type based on zone type"""
        if zone_type == "restricted":
            return "unauthorized_entry"
        elif zone_type == "safe":
            return "safe_zone_entry"
        elif zone_type == "emergency":
            return "emergency_zone_entry"
        else:
            return "unknown_zone_entry"
    
    async def process_geofence_violation(self, violation: Dict):
        """Process a geofence violation"""
        try:
            # Create alert record
            alert_data = {
                "tourist_id": violation["tourist_id"],
                "alert_type": "geofence",
                "message": self.generate_violation_message(violation),
                "severity": self.get_violation_severity(violation["zone_type"]),
                "location_lat": violation["location"]["lat"],
                "location_lng": violation["location"]["lng"],
                "zone_info": {
                    "zone_id": violation["zone_id"],
                    "zone_name": violation["zone_name"],
                    "zone_type": violation["zone_type"]
                },
                "timestamp": violation["timestamp"]
            }
            
            # Store in MongoDB for audit
            await self.store_geofence_event(alert_data)
            
            # Send real-time notifications
            await self.send_geofence_notifications(alert_data)
            
            # Store alert in PostgreSQL
            await self.create_alert_record(alert_data)
            
        except Exception as e:
            print(f"Error processing geofence violation: {e}")
    
    def generate_violation_message(self, violation: Dict) -> str:
        """Generate human-readable violation message"""
        zone_name = violation["zone_name"]
        zone_type = violation["zone_type"]
        
        if zone_type == "restricted":
            return f"Tourist has entered restricted area: {zone_name}. Immediate attention required."
        elif zone_type == "safe":
            return f"Tourist has entered safe zone: {zone_name}."
        elif zone_type == "emergency":
            return f"Tourist has entered emergency zone: {zone_name}. Check if assistance is needed."
        else:
            return f"Tourist has entered monitored area: {zone_name}."
    
    def get_violation_severity(self, zone_type: str) -> str:
        """Determine alert severity based on zone type"""
        severity_map = {
            "restricted": "high",
            "safe": "low",
            "emergency": "medium",
            "default": "medium"
        }
        return severity_map.get(zone_type, severity_map["default"])
    
    async def store_geofence_event(self, event_data: Dict):
        """Store geofence event in MongoDB for audit trail"""
        try:
            collection = async_mongo_db.geofence_events
            await collection.insert_one({
                **event_data,
                "created_at": datetime.now()
            })
        except Exception as e:
            print(f"Error storing geofence event in MongoDB: {e}")
    
    async def send_geofence_notifications(self, alert_data: Dict):
        """Send real-time notifications via WebSocket"""
        try:
            if not self.websocket_manager:
                return
            
            # Notification for tourist
            tourist_notification = {
                "type": "geofence_alert",
                "message": self.generate_tourist_notification(alert_data),
                "severity": alert_data["severity"],
                "zone_info": alert_data["zone_info"],
                "timestamp": alert_data["timestamp"]
            }
            
            # Send to tourist
            await self.websocket_manager.send_user_message(
                json.dumps(tourist_notification),
                str(alert_data["tourist_id"])
            )
            
            # Notification for police (if high severity)
            if alert_data["severity"] in ["high", "critical"]:
                police_notification = {
                    "type": "geofence_violation",
                    "tourist_id": alert_data["tourist_id"],
                    "message": alert_data["message"],
                    "location": {
                        "lat": alert_data["location_lat"],
                        "lng": alert_data["location_lng"]
                    },
                    "zone_info": alert_data["zone_info"],
                    "severity": alert_data["severity"],
                    "timestamp": alert_data["timestamp"]
                }
                
                # Broadcast to police dashboard
                await self.websocket_manager.broadcast_to_role(
                    json.dumps(police_notification),
                    "police"
                )
            
        except Exception as e:
            print(f"Error sending geofence notifications: {e}")
    
    def generate_tourist_notification(self, alert_data: Dict) -> str:
        """Generate notification message for tourist"""
        zone_type = alert_data["zone_info"]["zone_type"]
        zone_name = alert_data["zone_info"]["zone_name"]
        
        if zone_type == "restricted":
            return f"⚠️ WARNING: You have entered a restricted area ({zone_name}). Please exit immediately for your safety."
        elif zone_type == "safe":
            return f"✅ You have entered a safe zone ({zone_name}). Enjoy your visit!"
        elif zone_type == "emergency":
            return f"🏥 You are near emergency services ({zone_name}). Help is available if needed."
        else:
            return f"📍 You have entered a monitored area ({zone_name})."
    
    async def create_alert_record(self, alert_data: Dict):
        """Create alert record in PostgreSQL"""
        try:
            # This would be implemented with actual database session
            # For now, just log the alert
            print(f"Alert created: {alert_data['message']}")
        except Exception as e:
            print(f"Error creating alert record: {e}")
    
    def add_geofence_zone(self, zone_data: Dict) -> Dict:
        """Add a new geofence zone"""
        try:
            zone_id = f"zone_{len(self.active_zones) + 1}"
            
            # Create polygon from coordinates
            coords = [(lng, lat) for lng, lat in zone_data["coordinates"]]
            polygon = Polygon(coords)
            
            zone = {
                "id": len(self.active_zones) + 1,
                "name": zone_data["name"],
                "type": zone_data["type"],
                "coordinates": zone_data["coordinates"],
                "polygon": polygon
            }
            
            self.active_zones[zone_id] = zone
            
            return {
                "success": True,
                "zone_id": zone_id,
                "message": f"Geofence zone '{zone_data['name']}' added successfully"
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }
    
    def remove_geofence_zone(self, zone_id: str) -> Dict:
        """Remove a geofence zone"""
        try:
            if zone_id in self.active_zones:
                zone_name = self.active_zones[zone_id]["name"]
                del self.active_zones[zone_id]
                return {
                    "success": True,
                    "message": f"Geofence zone '{zone_name}' removed successfully"
                }
            else:
                return {
                    "success": False,
                    "error": "Zone not found"
                }
                
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }
    
    def get_all_zones(self) -> List[Dict]:
        """Get all active geofence zones"""
        zones = []
        for zone_id, zone in self.active_zones.items():
            zones.append({
                "id": zone["id"],
                "name": zone["name"],
                "type": zone["type"],
                "coordinates": zone["coordinates"]
            })
        return zones
    
    def get_zones_near_location(self, lat: float, lng: float, radius_km: float = 5) -> List[Dict]:
        """Get geofence zones near a specific location"""
        nearby_zones = []
        tourist_point = Point(lng, lat)
        
        for zone_id, zone in self.active_zones.items():
            # Calculate distance to zone boundary
            zone_center = zone["polygon"].centroid
            distance = calculate_distance_km((lat, lng), (zone_center.y, zone_center.x))
            
            if distance <= radius_km:
                nearby_zones.append({
                    "id": zone["id"],
                    "name": zone["name"],
                    "type": zone["type"],
                    "distance_km": round(distance, 2),
                    "coordinates": zone["coordinates"]
                })
        
        # Sort by distance
        nearby_zones.sort(key=lambda x: x["distance_km"])
        return nearby_zones

# Global geofencing service instance
geofencing_service = GeofencingService()