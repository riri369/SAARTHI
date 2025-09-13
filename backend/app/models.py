from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum

# Enums for data validation
class UserRole(str, Enum):
    admin = "admin"
    staff = "staff"
    super_admin = "super_admin"

class ReportStatus(str, Enum):
    pending = "Pending"
    in_progress = "In Progress" 
    resolved = "Resolved"

class ReportPriority(str, Enum):
    low = "low"
    medium = "medium"
    high = "high"
    critical = "critical"

class Department(str, Enum):
    public_works = "Public Works"
    electrical = "Electrical"
    sanitation = "Sanitation"
    water_supply = "Water Supply"
    traffic = "Traffic"
    parks_recreation = "Parks & Recreation"

# User/Employee Models
class UserBase(BaseModel):
    employee_id: str = Field(..., min_length=3, max_length=10)
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    role: UserRole = UserRole.staff
    department: Optional[Department] = None

class UserCreate(UserBase):
    password: str = Field(..., min_length=4)

class UserUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=100)
    email: Optional[EmailStr] = None
    role: Optional[UserRole] = None
    department: Optional[Department] = None

class UserOut(UserBase):
    created_at: datetime
    is_active: bool = True
    
    class Config:
        from_attributes = True

class UserInDB(UserOut):
    password: str

# Authentication Models
class LoginRequest(BaseModel):
    employee_id: str
    password: str

class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    employee_id: Optional[str] = None

# Report Models
class ReportBase(BaseModel):
    title: str = Field(..., min_length=5, max_length=200)
    description: str = Field(..., min_length=10, max_length=1000)
    department: Department
    location: str = Field(..., min_length=2, max_length=100)
    priority: ReportPriority = ReportPriority.medium
    coordinates: Optional[List[float]] = Field(None, min_items=2, max_items=2)

class ReportCreate(ReportBase):
    pass

class ReportUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=5, max_length=200)
    description: Optional[str] = Field(None, min_length=10, max_length=1000)
    department: Optional[Department] = None
    status: Optional[ReportStatus] = None
    location: Optional[str] = Field(None, min_length=2, max_length=100)
    priority: Optional[ReportPriority] = None
    coordinates: Optional[List[float]] = Field(None, min_items=2, max_items=2)

class ReportOut(ReportBase):
    id: str
    user: str  # User name who created the report
    status: ReportStatus = ReportStatus.pending
    created_at: datetime
    updated_at: datetime
    assigned_to: Optional[str] = None  # Employee assigned to handle the report
    
    class Config:
        from_attributes = True

class ReportInDB(ReportOut):
    user_id: str  # Employee ID who created the report

# Statistics Models
class DepartmentStats(BaseModel):
    department: Department
    submitted: int = 0
    resolved: int = 0
    in_progress: int = 0
    pending: int = 0

class OverallStats(BaseModel):
    total_submitted: int = 0
    total_resolved: int = 0
    total_in_progress: int = 0
    total_pending: int = 0
    departments: List[DepartmentStats] = []

class TopPerformer(BaseModel):
    name: str
    employee_id: str
    points: int = 0
    reports_submitted: int = 0
    reports_resolved: int = 0

class StatsResponse(BaseModel):
    submitted: int
    resolved: int
    inProgress: int
    top_performers: List[TopPerformer]

# Filter Models
class ReportFilter(BaseModel):
    department: Optional[Department] = None
    status: Optional[ReportStatus] = None
    location: Optional[str] = None
    priority: Optional[ReportPriority] = None
    date_from: Optional[datetime] = None
    date_to: Optional[datetime] = None
    assigned_to: Optional[str] = None
    search: Optional[str] = None  # For text search

# Response Models
class MessageResponse(BaseModel):
    message: str
    success: bool = True

class ErrorResponse(BaseModel):
    detail: str
    error_code: Optional[str] = None

# Pagination Models
class PaginationParams(BaseModel):
    skip: int = Field(0, ge=0)
    limit: int = Field(50, ge=1, le=100)

class PaginatedResponse(BaseModel):
    items: List[ReportOut]
    total: int
    skip: int
    limit: int
    has_more: bool

# File Upload Models (for future media upload feature)
class FileUploadResponse(BaseModel):
    filename: str
    file_path: str
    file_size: int
    content_type: str
    upload_timestamp: datetime

# City/Location Models
class CityCoordinates(BaseModel):
    city: str
    latitude: float
    longitude: float

class LocationResponse(BaseModel):
    cities: List[CityCoordinates]
