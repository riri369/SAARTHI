from datetime import datetime
from typing import Optional, List
import re
import uuid
from fastapi import HTTPException, status
from app.models import ReportStatus, Department, ReportPriority

def generate_report_id() -> str:
    """Generate unique report ID"""
    timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
    random_suffix = str(uuid.uuid4()).split('-')[0].upper()
    return f"R{timestamp}{random_suffix}"

def validate_employee_id(employee_id: str) -> bool:
    """Validate employee ID format (E001, E002, etc.)"""
    pattern = r'^E\d{3,}$'
    return bool(re.match(pattern, employee_id))

def validate_coordinates(coordinates: List[float]) -> bool:
    """Validate latitude and longitude coordinates"""
    if len(coordinates) != 2:
        return False
    
    lat, lng = coordinates
    # Basic validation for coordinates in India
    if not (-90 <= lat <= 90) or not (-180 <= lng <= 180):
        return False
    
    # More specific validation for Odisha region (rough bounds)
    if not (17 <= lat <= 23) or not (81 <= lng <= 88):
        return False
        
    return True

def get_city_from_coordinates(coordinates: List[float]) -> Optional[str]:
    """Get city name from coordinates (simplified mapping)"""
    from config import settings
    
    if not coordinates or len(coordinates) != 2:
        return None
        
    lat, lng = coordinates
    min_distance = float('inf')
    closest_city = None
    
    for city, city_coords in settings.CITY_COORDINATES.items():
        city_lat, city_lng = city_coords
        distance = ((lat - city_lat) ** 2 + (lng - city_lng) ** 2) ** 0.5
        if distance < min_distance:
            min_distance = distance
            closest_city = city
    
    # If coordinates are within reasonable distance (0.1 degrees ~ 11km)
    if min_distance < 0.1:
        return closest_city
    return None

def calculate_priority_from_keywords(description: str) -> ReportPriority:
    """Auto-calculate priority based on description keywords"""
    description_lower = description.lower()
    
    critical_keywords = ['emergency', 'danger', 'urgent', 'fire', 'flood', 'accident', 'injury']
    high_keywords = ['broken', 'not working', 'overflow', 'leak', 'traffic', 'blocked']
    medium_keywords = ['repair', 'maintenance', 'clean', 'fix']
    
    if any(keyword in description_lower for keyword in critical_keywords):
        return ReportPriority.critical
    elif any(keyword in description_lower for keyword in high_keywords):
        return ReportPriority.high
    elif any(keyword in description_lower for keyword in medium_keywords):
        return ReportPriority.medium
    else:
        return ReportPriority.low

def calculate_user_points(action: str, report_status: Optional[ReportStatus] = None) -> int:
    """Calculate points for user actions"""
    from config import settings
    
    points = 0
    
    if action == "submit_report":
        points = settings.POINTS_SYSTEM["report_submitted"]
    elif action == "resolve_report":
        points = settings.POINTS_SYSTEM["report_resolved"]
    elif action == "verify_report":
        points = settings.POINTS_SYSTEM["report_verified"]
    
    # Bonus points based on priority/urgency
    if report_status == ReportStatus.resolved:
        points += 5  # Bonus for resolution
    
    return points

def format_datetime_response(dt: datetime) -> str:
    """Format datetime for consistent API responses"""
    return dt.isoformat()

def parse_search_query(query: str) -> dict:
    """Parse search query for text search"""
    if not query or len(query.strip()) < 2:
        return {}
    
    # MongoDB text search format
    return {
        "$text": {
            "$search": query.strip(),
            "$caseSensitive": False
        }
    }

def build_report_filter(
    department: Optional[Department] = None,
    status: Optional[ReportStatus] = None,
    location: Optional[str] = None,
    priority: Optional[ReportPriority] = None,
    search: Optional[str] = None,
    date_from: Optional[datetime] = None,
    date_to: Optional[datetime] = None
) -> dict:
    """Build MongoDB filter query for reports"""
    filter_query = {}
    
    if department:
        filter_query["department"] = department.value
    
    if status:
        filter_query["status"] = status.value
    
    if location:
        filter_query["location"] = {"$regex": location, "$options": "i"}
    
    if priority:
        filter_query["priority"] = priority.value
    
    if search:
        search_filter = parse_search_query(search)
        filter_query.update(search_filter)
    
    # Date range filter
    if date_from or date_to:
        date_filter = {}
        if date_from:
            date_filter["$gte"] = date_from
        if date_to:
            date_filter["$lte"] = date_to
        filter_query["created_at"] = date_filter
    
    return filter_query

def validate_status_transition(current_status: ReportStatus, new_status: ReportStatus) -> bool:
    """Validate if status transition is allowed"""
    allowed_transitions = {
        ReportStatus.pending: [ReportStatus.in_progress],
        ReportStatus.in_progress: [ReportStatus.resolved, ReportStatus.pending],
        ReportStatus.resolved: []  # No transitions from resolved
    }
    
    return new_status in allowed_transitions.get(current_status, [])

def sanitize_filename(filename: str) -> str:
    """Sanitize filename for file uploads"""
    # Remove dangerous characters
    sanitized = re.sub(r'[<>:"/\\|?*]', '_', filename)
    # Limit length
    if len(sanitized) > 100:
        name, ext = sanitized.rsplit('.', 1) if '.' in sanitized else (sanitized, '')
        sanitized = name[:95] + ('.' + ext if ext else '')
    return sanitized

# Error handling utilities
def handle_database_error(error: Exception) -> HTTPException:
    """Handle database errors and return appropriate HTTP exceptions"""
    error_msg = str(error)
    
    if "duplicate key" in error_msg.lower():
        return HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Resource already exists"
        )
    elif "not found" in error_msg.lower():
        return HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resource not found"
        )
    else:
        return HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )
