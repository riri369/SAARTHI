import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "mongodb://localhost:27017/saarthi_db")
    DATABASE_NAME: str = "saarthi_db"
    
    # JWT
    SECRET_KEY: str = os.getenv("SECRET_KEY", "your-super-secret-jwt-key-change-this")
    ALGORITHM: str = os.getenv("ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 30))
    
    # CORS
    ALLOWED_ORIGINS: list = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000,http://localhost:5173").split(",")
    
    # File Upload
    UPLOAD_DIRECTORY: str = os.getenv("UPLOAD_DIRECTORY", "uploads/")
    MAX_FILE_SIZE: int = int(os.getenv("MAX_FILE_SIZE", 5242880))  # 5MB
    
    # City Coordinates (for map integration)
    CITY_COORDINATES = {
        "Bhubaneswar": [20.296059, 85.824539],
        "Cuttack": [20.462521, 85.882988], 
        "Puri": [19.813457, 85.831207],
        "Rourkela": [22.227056, 84.861181]
    }
    
    # Departments
    DEPARTMENTS = [
        "Public Works",
        "Electrical", 
        "Sanitation",
        "Water Supply",
        "Traffic",
        "Parks & Recreation"
    ]
    
    # Report Status Options
    REPORT_STATUS = ["Pending", "In Progress", "Resolved"]
    
    # Point System for Gamification
    POINTS_SYSTEM = {
        "report_submitted": 10,
        "report_resolved": 25,
        "report_verified": 15
    }

settings = Settings()
