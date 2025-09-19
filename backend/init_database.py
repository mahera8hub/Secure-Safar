"""Database initialization script"""
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from database import DATABASE_URL, MONGODB_URL, MONGODB_DATABASE
from models import Base
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import pymongo

def create_postgresql_tables():
    """Create all PostgreSQL tables"""
    try:
        engine = create_engine(DATABASE_URL)
        Base.metadata.create_all(bind=engine)
        print("✅ PostgreSQL tables created successfully")
        return True
    except Exception as e:
        print(f"❌ Error creating PostgreSQL tables: {e}")
        return False

async def setup_mongodb_collections():
    """Set up MongoDB collections and indexes"""
    try:
        client = AsyncIOMotorClient(MONGODB_URL)
        db = client[MONGODB_DATABASE]
        
        # Create collections
        collections = [
            "location_history",
            "geofence_events",
            "anomaly_logs",
            "audit_logs",
            "notifications"
        ]
        
        for collection_name in collections:
            await db.create_collection(collection_name)
            print(f"✅ Created MongoDB collection: {collection_name}")
        
        # Create indexes for performance
        # Location history with geospatial index
        await db.location_history.create_index([("location", pymongo.GEOSPHERE)])
        await db.location_history.create_index([("tourist_id", 1), ("timestamp", -1)])
        
        # Geofence events
        await db.geofence_events.create_index([("tourist_id", 1), ("created_at", -1)])
        await db.geofence_events.create_index([("zone_id", 1)])
        
        # Anomaly logs
        await db.anomaly_logs.create_index([("tourist_id", 1), ("timestamp", -1)])
        await db.anomaly_logs.create_index([("anomaly_flag", 1)])
        
        print("✅ MongoDB indexes created successfully")
        return True
        
    except Exception as e:
        print(f"❌ Error setting up MongoDB: {e}")
        return False

def seed_sample_data():
    """Seed database with sample data for testing"""
    try:
        engine = create_engine(DATABASE_URL)
        SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
        db = SessionLocal()
        
        from models import User, UserRole, TouristProfile, PoliceProfile, GeofenceZone
        from datetime import datetime
        
        # Check if admin user exists
        admin_user = db.query(User).filter(User.email == "admin@securesafar.com").first()
        if not admin_user:
            # Create admin user
            admin_user = User(
                email="admin@securesafar.com",
                username="admin",
                full_name="System Administrator",
                role=UserRole.TOURISM_AUTHORITY,
                is_active=True
            )
            admin_user.set_password("admin123")
            db.add(admin_user)
        
        # Create sample police user
        police_user = db.query(User).filter(User.email == "police@securesafar.com").first()
        if not police_user:
            police_user = User(
                email="police@securesafar.com",
                username="police",
                full_name="Police Officer",
                role=UserRole.POLICE,
                is_active=True
            )
            police_user.set_password("police123")
            db.add(police_user)
            db.commit()
            db.refresh(police_user)
            
            # Create police profile
            police_profile = PoliceProfile(
                user_id=police_user.id,
                badge_number="P001",
                department="Tourism Police",
                jurisdiction_area='{"type": "Polygon", "coordinates": [[[77.2, 28.6], [77.22, 28.6], [77.22, 28.62], [77.2, 28.62], [77.2, 28.6]]]}'
            )
            db.add(police_profile)
        
        # Create sample tourist user
        tourist_user = db.query(User).filter(User.email == "tourist@securesafar.com").first()
        if not tourist_user:
            tourist_user = User(
                email="tourist@securesafar.com",
                username="tourist",
                full_name="John Doe",
                role=UserRole.TOURIST,
                is_active=True
            )
            tourist_user.set_password("tourist123")
            db.add(tourist_user)
            db.commit()
            db.refresh(tourist_user)
            
            # Create tourist profile
            tourist_profile = TouristProfile(
                user_id=tourist_user.id,
                passport_number="US123456789",
                nationality="United States",
                phone_number="+1-555-123-4567",
                emergency_contact="Emergency Contact: +1-555-987-6543",
                safety_score=95.0
            )
            db.add(tourist_profile)
        
        # Create sample geofence zones
        restricted_zone = db.query(GeofenceZone).filter(GeofenceZone.name == "Government District").first()
        if not restricted_zone:
            restricted_zone = GeofenceZone(
                name="Government District",
                zone_type="restricted",
                coordinates='[[77.2090, 28.6139], [77.2100, 28.6139], [77.2100, 28.6149], [77.2090, 28.6149], [77.2090, 28.6139]]',
                is_active=True
            )
            db.add(restricted_zone)
        
        safe_zone = db.query(GeofenceZone).filter(GeofenceZone.name == "Tourist Hub").first()
        if not safe_zone:
            safe_zone = GeofenceZone(
                name="Tourist Hub",
                zone_type="safe",
                coordinates='[[77.2000, 28.6100], [77.2050, 28.6100], [77.2050, 28.6150], [77.2000, 28.6150], [77.2000, 28.6100]]',
                is_active=True
            )
            db.add(safe_zone)
        
        db.commit()
        db.close()
        
        print("✅ Sample data seeded successfully")
        print("\n📋 Sample user accounts created:")
        print("Admin: admin@securesafar.com / admin123")
        print("Police: police@securesafar.com / police123") 
        print("Tourist: tourist@securesafar.com / tourist123")
        
        return True
        
    except Exception as e:
        print(f"❌ Error seeding sample data: {e}")
        return False

async def initialize_database():
    """Initialize complete database setup"""
    print("🚀 Initializing SecureSafar Database...")
    
    # Create PostgreSQL tables
    pg_success = create_postgresql_tables()
    
    # Setup MongoDB
    mongo_success = await setup_mongodb_collections()
    
    # Seed sample data
    seed_success = seed_sample_data()
    
    if pg_success and mongo_success and seed_success:
        print("\n✅ Database initialization completed successfully!")
        print("🎉 SecureSafar backend is ready to use!")
        return True
    else:
        print("\n❌ Database initialization failed!")
        return False

if __name__ == "__main__":
    asyncio.run(initialize_database())