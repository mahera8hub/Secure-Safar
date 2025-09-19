from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
import os

# Database URL - using SQLite for demo
SQLALCHEMY_DATABASE_URL = "sqlite:///./securesafar.db"

# Create engine
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, 
    connect_args={"check_same_thread": False}  # for SQLite only
)

# Create SessionLocal class
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create Base class
Base = declarative_base()

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Fake MongoDB for demo purposes
class FakeMongoDB:
    def __init__(self):
        self.location_history = self
        
    async def insert_one(self, document):
        print(f"Mock MongoDB insert: {document}")
        return {"inserted_id": "mock_id"}

# Dependency to get MongoDB session
async def get_mongo_db():
    return FakeMongoDB()