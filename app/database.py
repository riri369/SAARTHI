from motor.motor_asyncio import AsyncIOMotorClient
from pymongo import IndexModel, TEXT
import asyncio
from app.config import settings

class Database:
    client = None  # type: ignore  # type: AsyncIOMotorClient
    database = None

# Database connection
async def connect_to_mongo():
    """Create database connection"""
    Database.client = AsyncIOMotorClient(settings.DATABASE_URL)
    Database.database = Database.client[settings.DATABASE_NAME]
    
    # Create indexes for better performance
    await create_indexes()
    print(f"Connected to MongoDB: {settings.DATABASE_NAME}")

async def close_mongo_connection():
    """Close database connection"""
    Database.client.close()
    print("Disconnected from MongoDB")

async def get_database():
    """Get database instance"""
    return Database.database

# Create indexes for better query performance
async def create_indexes():
    """Create database indexes for optimized queries"""
    db = Database.database
    
    # Users collection indexes
    await db.users.create_index("employee_id", unique=True)
    await db.users.create_index("email", unique=True)
    
    # Reports collection indexes  
    await db.reports.create_index("status")
    await db.reports.create_index("department")
    await db.reports.create_index("location")
    await db.reports.create_index("created_at")
    await db.reports.create_index([
        ("title", TEXT), 
        ("description", TEXT)
    ])  # Text search index
    
    # Performance tracking
    await db.user_stats.create_index("user_id", unique=True)

# Initialize sample data for development
async def init_sample_data():
    """Initialize sample data for development/testing"""
    db = Database.database
    
    # Check if sample data already exists
    if await db.users.count_documents({}) > 0:
        return
    
    from app.auth import get_password_hash
    
    # Sample employees (matching frontend expectations)
    sample_employees = [
        {
            "employee_id": "E001",
            "name": "Ananya Gupta", 
            "email": "ananya.gupta@saarthi.gov.in",
            "password": get_password_hash("1234"),
            "role": "admin",
            "department": "Public Works",
            "created_at": "2025-01-01T00:00:00"
        },
        {
            "employee_id": "E002", 
            "name": "Vikram Singh",
            "email": "vikram.singh@saarthi.gov.in", 
            "password": get_password_hash("1234"),
            "role": "staff",
            "department": "Electrical",
            "created_at": "2025-01-01T00:00:00"
        },
        {
            "employee_id": "E003",
            "name": "Meena Nair",
            "email": "meena.nair@saarthi.gov.in",
            "password": get_password_hash("1234"), 
            "role": "staff",
            "department": "Sanitation", 
            "created_at": "2025-01-01T00:00:00"
        }
    ]
    
    # Insert sample employees
    await db.users.insert_many(sample_employees)
    
    # Sample reports (matching frontend expectations)
    sample_reports = [
        {
            "id": "R001",
            "user": "Ananya Gupta",
            "title": "Pothole Issue",
            "description": "Pothole near MG Road", 
            "department": "Public Works",
            "status": "Pending",
            "location": "Bhubaneswar",
            "coordinates": settings.CITY_COORDINATES["Bhubaneswar"],
            "priority": "medium",
            "created_at": "2025-09-10T10:00:00",
            "updated_at": "2025-09-10T10:00:00"
        },
        {
            "id": "R002", 
            "user": "Vikram Singh",
            "title": "Street Light Malfunction",
            "description": "Streetlight not working",
            "department": "Electrical", 
            "status": "In Progress",
            "location": "Cuttack",
            "coordinates": settings.CITY_COORDINATES["Cuttack"],
            "priority": "high",
            "created_at": "2025-09-11T14:30:00",
            "updated_at": "2025-09-11T16:00:00"
        },
        {
            "id": "R003",
            "user": "Meena Nair", 
            "title": "Waste Management Issue",
            "description": "Overflowing trash bin",
            "department": "Sanitation",
            "status": "Resolved", 
            "location": "Puri",
            "coordinates": settings.CITY_COORDINATES["Puri"],
            "priority": "low",
            "created_at": "2025-09-08T09:00:00",
            "updated_at": "2025-09-09T11:00:00"
        },
        {
            "id": "R004",
            "user": "Rohit Kumar",
            "title": "Infrastructure Damage", 
            "description": "Broken bench",
            "department": "Public Works",
            "status": "Pending",
            "location": "Rourkela",
            "coordinates": settings.CITY_COORDINATES["Rourkela"], 
            "priority": "low",
            "created_at": "2025-09-12T08:00:00",
            "updated_at": "2025-09-12T08:00:00"
        }
    ]
    
    await db.reports.insert_many(sample_reports)
    
    # Sample user stats for top performers
    sample_user_stats = [
        {
            "user_id": "E001",
            "user_name": "Ananya Gupta",
            "points": 150,
            "reports_submitted": 8,
            "reports_resolved": 5
        },
        {
            "user_id": "E002", 
            "user_name": "Vikram Singh",
            "points": 120,
            "reports_submitted": 6,
            "reports_resolved": 4
        },
        {
            "user_id": "E003",
            "user_name": "Meena Nair", 
            "points": 95,
            "reports_submitted": 4,
            "reports_resolved": 3
        }
    ]
    
    await db.user_stats.insert_many(sample_user_stats)
    
    print("Sample data initialized successfully")
