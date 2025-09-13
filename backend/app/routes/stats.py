from fastapi import APIRouter, HTTPException, status, Depends
from typing import List
from app.models import StatsResponse, TopPerformer, OverallStats, UserInDB
from app.auth import get_current_active_user
from app.database import get_database
from app.utils import handle_database_error

router = APIRouter(prefix="/stats", tags=["Statistics"])

@router.get("/summary", response_model=StatsResponse)
async def get_stats_summary(
    current_user: UserInDB = Depends(get_current_active_user)
):
    """
    Get overall statistics summary for dashboard
    
    Returns counts of submitted, resolved, and in-progress reports
    along with top performers
    """
    try:
        db = await get_database()
        
        # Get report counts by status
        pipeline_stats = [
            {
                "$group": {
                    "_id": "$status",
                    "count": {"$sum": 1}
                }
            }
        ]
        
        status_counts = await db.reports.aggregate(pipeline_stats).to_list(length=None)
        
        # Initialize counters
        stats = {
            "submitted": 0,
            "resolved": 0,
            "inProgress": 0
        }
        
        # Parse status counts
        for item in status_counts:
            if item["_id"] == "Pending":
                stats["submitted"] = item["count"]
            elif item["_id"] == "Resolved":
                stats["resolved"] = item["count"]
            elif item["_id"] == "In Progress":
                stats["inProgress"] = item["count"]
        
        # Get total submitted (all reports)
        total_reports = await db.reports.count_documents({})
        stats["submitted"] = total_reports
        
        # Get top performers
        top_performers_data = await db.user_stats.find({}).sort("points", -1).limit(5).to_list(length=5)
        
        top_performers = [
            TopPerformer(
                name=performer.get("user_name", "Unknown"),
                employee_id=performer.get("user_id", ""),
                points=performer.get("points", 0),
                reports_submitted=performer.get("reports_submitted", 0),
                reports_resolved=performer.get("reports_resolved", 0)
            )
            for performer in top_performers_data
        ]
        
        return StatsResponse(
            submitted=stats["submitted"],
            resolved=stats["resolved"],
            inProgress=stats["inProgress"],
            top_performers=top_performers
        )
        
    except Exception as e:
        raise handle_database_error(e)

@router.get("/top-performers", response_model=List[TopPerformer])
async def get_top_performers(
    limit: int = 10,
    current_user: UserInDB = Depends(get_current_active_user)
):
    """
    Get top performing users based on points
    """
    try:
        db = await get_database()
        
        performers_data = await db.user_stats.find({}).sort("points", -1).limit(limit).to_list(length=limit)
        
        performers = [
            TopPerformer(
                name=performer.get("user_name", "Unknown"),
                employee_id=performer.get("user_id", ""),
                points=performer.get("points", 0),
                reports_submitted=performer.get("reports_submitted", 0),
                reports_resolved=performer.get("reports_resolved", 0)
            )
            for performer in performers_data
        ]
        
        return performers
        
    except Exception as e:
        raise handle_database_error(e)

@router.get("/department-wise")
async def get_department_statistics(
    current_user: UserInDB = Depends(get_current_active_user)
):
    """
    Get statistics broken down by department
    """
    try:
        db = await get_database()
        
        # Aggregate stats by department and status
        pipeline = [
            {
                "$group": {
                    "_id": {
                        "department": "$department",
                        "status": "$status"
                    },
                    "count": {"$sum": 1}
                }
            },
            {
                "$group": {
                    "_id": "$_id.department",
                    "stats": {
                        "$push": {
                            "status": "$_id.status",
                            "count": "$count"
                        }
                    }
                }
            }
        ]
        
        dept_stats = await db.reports.aggregate(pipeline).to_list(length=None)
        
        # Format response
        formatted_stats = []
        for dept_data in dept_stats:
            department = dept_data["_id"]
            stats = {"submitted": 0, "resolved": 0, "in_progress": 0, "pending": 0}
            
            total_submitted = 0
            for stat in dept_data["stats"]:
                count = stat["count"]
                total_submitted += count
                
                if stat["status"] == "Resolved":
                    stats["resolved"] = count
                elif stat["status"] == "In Progress":
                    stats["in_progress"] = count
                elif stat["status"] == "Pending":
                    stats["pending"] = count
            
            stats["submitted"] = total_submitted
            
            formatted_stats.append({
                "department": department,
                **stats
            })
        
        return formatted_stats
        
    except Exception as e:
        raise handle_database_error(e)

@router.get("/trends")
async def get_trends_data(
    days: int = 30,
    current_user: UserInDB = Depends(get_current_active_user)
):
    """
    Get trends data for the last N days
    """
    try:
        db = await get_database()
        
        from datetime import datetime, timedelta
        
        start_date = datetime.utcnow() - timedelta(days=days)
        
        pipeline = [
            {
                "$match": {
                    "created_at": {"$gte": start_date}
                }
            },
            {
                "$group": {
                    "_id": {
                        "$dateToString": {
                            "format": "%Y-%m-%d",
                            "date": "$created_at"
                        }
                    },
                    "reports_created": {"$sum": 1},
                    "resolved": {
                        "$sum": {
                            "$cond": [{"$eq": ["$status", "Resolved"]}, 1, 0]
                        }
                    }
                }
            },
            {
                "$sort": {"_id": 1}
            }
        ]
        
        trends = await db.reports.aggregate(pipeline).to_list(length=None)
        
        return {
            "period_days": days,
            "trends": trends
        }
        
    except Exception as e:
        raise handle_database_error(e)

@router.get("/user/{employee_id}")
async def get_user_statistics(
    employee_id: str,
    current_user: UserInDB = Depends(get_current_active_user)
):
    """
    Get statistics for a specific user
    """
    try:
        db = await get_database()
        
        # Check if requesting own stats or if admin
        if employee_id != current_user.employee_id and current_user.role not in ["admin", "super_admin"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Can only view own statistics unless admin"
            )
        
        # Get user stats
        user_stats = await db.user_stats.find_one({"user_id": employee_id})
        
        if not user_stats:
            # Initialize empty stats if user hasn't performed any actions yet
            user_stats = {
                "user_id": employee_id,
                "user_name": current_user.name if employee_id == current_user.employee_id else "Unknown",
                "points": 0,
                "reports_submitted": 0,
                "reports_resolved": 0
            }
        
        # Get detailed report breakdown
        user_reports_pipeline = [
            {
                "$match": {"user_id": employee_id}
            },
            {
                "$group": {
                    "_id": "$status",
                    "count": {"$sum": 1}
                }
            }
        ]
        
        user_reports_stats = await db.reports.aggregate(user_reports_pipeline).to_list(length=None)
        
        report_breakdown = {"Pending": 0, "In Progress": 0, "Resolved": 0}
        for stat in user_reports_stats:
            report_breakdown[stat["_id"]] = stat["count"]
        
        return {
            **user_stats,
            "report_breakdown": report_breakdown
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise handle_database_error(e)
