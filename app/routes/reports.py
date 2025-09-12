from fastapi import APIRouter, HTTPException, status, Depends, Query
from typing import List, Optional
from datetime import datetime
from app.models import (
    ReportCreate, ReportUpdate, ReportOut, ReportFilter, 
    PaginatedResponse, MessageResponse, UserInDB, ReportStatus, 
    Department, ReportPriority
)
from app.auth import get_current_active_user, require_admin_role
from app.database import get_database
from app.utils import (
    generate_report_id, validate_coordinates, get_city_from_coordinates,
    calculate_priority_from_keywords, build_report_filter, 
    validate_status_transition, handle_database_error, calculate_user_points
)

router = APIRouter(prefix="/reports", tags=["Reports"])

@router.get("/", response_model=PaginatedResponse)
async def get_reports(
    skip: int = Query(0, ge=0, description="Number of reports to skip"),
    limit: int = Query(50, ge=1, le=100, description="Number of reports to return"),
    department: Optional[Department] = Query(None, description="Filter by department"),
    status: Optional[ReportStatus] = Query(None, description="Filter by status"),
    location: Optional[str] = Query(None, description="Filter by location"),
    priority: Optional[ReportPriority] = Query(None, description="Filter by priority"),
    search: Optional[str] = Query(None, description="Search in title and description"),
    date_from: Optional[datetime] = Query(None, description="Filter reports from this date"),
    date_to: Optional[datetime] = Query(None, description="Filter reports until this date"),
    current_user: UserInDB = Depends(get_current_active_user)
):
    """
    Get paginated list of reports with filtering options
    """
    try:
        db = await get_database()
        
        # Build filter query
        filter_query = build_report_filter(
            department=department,
            status=status, 
            location=location,
            priority=priority,
            search=search,
            date_from=date_from,
            date_to=date_to
        )
        
        # Get total count for pagination
        total = await db.reports.count_documents(filter_query)
        
        # Get reports with pagination
        cursor = db.reports.find(filter_query).skip(skip).limit(limit).sort("created_at", -1)
        reports_data = await cursor.to_list(length=limit)
        
        # Convert to response models
        reports = [ReportOut(**report) for report in reports_data]
        
        return PaginatedResponse(
            items=reports,
            total=total,
            skip=skip,
            limit=limit,
            has_more=(skip + limit) < total
        )
        
    except Exception as e:
        raise handle_database_error(e)

@router.post("/", response_model=ReportOut)
async def create_report(
    report_data: ReportCreate,
    current_user: UserInDB = Depends(get_current_active_user)
):
    """
    Create a new civic issue report
    """
    try:
        db = await get_database()
        
        # Generate unique report ID
        report_id = generate_report_id()
        
        # Validate coordinates if provided
        if report_data.coordinates:
            if not validate_coordinates(report_data.coordinates):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid coordinates provided"
                )
            
            # Auto-detect city from coordinates if location not precise
            detected_city = get_city_from_coordinates(report_data.coordinates)
            if detected_city and detected_city.lower() not in report_data.location.lower():
                report_data.location = f"{report_data.location}, {detected_city}"
        
        # Auto-calculate priority if not specified
        if report_data.priority == ReportPriority.medium:
            auto_priority = calculate_priority_from_keywords(report_data.description)
            report_data.priority = auto_priority
        
        # Create report document
        report_doc = {
            "id": report_id,
            "user": current_user.name,
            "user_id": current_user.employee_id,
            "title": report_data.title,
            "description": report_data.description,
            "department": report_data.department.value,
            "location": report_data.location,
            "coordinates": report_data.coordinates,
            "priority": report_data.priority.value,
            "status": ReportStatus.pending.value,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        
        # Insert report
        result = await db.reports.insert_one(report_doc)
        
        # Update user stats (add points for submitting report)
        points_earned = calculate_user_points("submit_report")
        await db.user_stats.update_one(
            {"user_id": current_user.employee_id},
            {
                "$inc": {
                    "points": points_earned,
                    "reports_submitted": 1
                },
                "$set": {"user_name": current_user.name}
            },
            upsert=True
        )
        
        return ReportOut(**report_doc)
        
    except Exception as e:
        raise handle_database_error(e)

@router.get("/{report_id}", response_model=ReportOut)
async def get_report(
    report_id: str,
    current_user: UserInDB = Depends(get_current_active_user)
):
    """
    Get a specific report by ID
    """
    try:
        db = await get_database()
        report_data = await db.reports.find_one({"id": report_id})
        
        if not report_data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Report not found"
            )
        
        return ReportOut(**report_data)
        
    except HTTPException:
        raise
    except Exception as e:
        raise handle_database_error(e)

@router.put("/{report_id}", response_model=ReportOut)
async def update_report(
    report_id: str,
    update_data: ReportUpdate,
    current_user: UserInDB = Depends(get_current_active_user)
):
    """
    Update a report (status updates require admin role)
    """
    try:
        db = await get_database()
        
        # Get existing report
        existing_report = await db.reports.find_one({"id": report_id})
        if not existing_report:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Report not found"
            )
        
        # Check permissions for status updates
        if update_data.status and update_data.status != existing_report["status"]:
            if current_user.role not in ["admin", "super_admin"]:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Only admins can update report status"
                )
            
            # Validate status transition
            current_status = ReportStatus(existing_report["status"])
            new_status = update_data.status
            if not validate_status_transition(current_status, new_status):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Invalid status transition from {current_status.value} to {new_status.value}"
                )
        
        # Build update document
        update_doc = {"updated_at": datetime.utcnow()}
        
        if update_data.title:
            update_doc["title"] = update_data.title
        if update_data.description:
            update_doc["description"] = update_data.description
        if update_data.department:
            update_doc["department"] = update_data.department.value
        if update_data.location:
            update_doc["location"] = update_data.location
        if update_data.priority:
            update_doc["priority"] = update_data.priority.value
        if update_data.coordinates:
            if validate_coordinates(update_data.coordinates):
                update_doc["coordinates"] = update_data.coordinates
            else:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid coordinates provided"
                )
        if update_data.status:
            update_doc["status"] = update_data.status.value
            
            # Award points if report is being resolved
            if update_data.status == ReportStatus.resolved:
                points_earned = calculate_user_points("resolve_report")
                await db.user_stats.update_one(
                    {"user_id": current_user.employee_id},
                    {
                        "$inc": {
                            "points": points_earned,
                            "reports_resolved": 1
                        }
                    },
                    upsert=True
                )
        
        # Update report
        result = await db.reports.update_one(
            {"id": report_id},
            {"$set": update_doc}
        )
        
        # Get updated report
        updated_report = await db.reports.find_one({"id": report_id})
        return ReportOut(**updated_report)
        
    except HTTPException:
        raise
    except Exception as e:
        raise handle_database_error(e)

@router.delete("/{report_id}", response_model=MessageResponse)
async def delete_report(
    report_id: str,
    current_user: UserInDB = Depends(require_admin_role)
):
    """
    Delete a report (admin only)
    """
    try:
        db = await get_database()
        
        result = await db.reports.delete_one({"id": report_id})
        
        if result.deleted_count == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Report not found"
            )
        
        return MessageResponse(
            message=f"Report {report_id} deleted successfully",
            success=True
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise handle_database_error(e)

@router.put("/{report_id}/status", response_model=ReportOut)
async def update_report_status(
    report_id: str,
    new_status: ReportStatus,
    current_user: UserInDB = Depends(require_admin_role)
):
    """
    Quick status update endpoint (admin only)
    """
    try:
        db = await get_database()
        
        # Get existing report
        existing_report = await db.reports.find_one({"id": report_id})
        if not existing_report:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Report not found"
            )
        
        # Validate status transition
        current_status = ReportStatus(existing_report["status"])
        if not validate_status_transition(current_status, new_status):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid status transition from {current_status.value} to {new_status.value}"
            )
        
        # Update status
        update_doc = {
            "status": new_status.value,
            "updated_at": datetime.utcnow()
        }
        
        await db.reports.update_one(
            {"id": report_id},
            {"$set": update_doc}
        )
        
        # Award points if resolved
        if new_status == ReportStatus.resolved:
            points_earned = calculate_user_points("resolve_report")
            await db.user_stats.update_one(
                {"user_id": current_user.employee_id},
                {"$inc": {"points": points_earned, "reports_resolved": 1}},
                upsert=True
            )
        
        # Return updated report
        updated_report = await db.reports.find_one({"id": report_id})
        return ReportOut(**updated_report)
        
    except HTTPException:
        raise
    except Exception as e:
        raise handle_database_error(e)