from fastapi import APIRouter, HTTPException, status, Depends
from typing import List
from app.models import UserOut, UserCreate, UserUpdate, MessageResponse, UserInDB
from auth import get_current_active_user, require_admin_role, get_password_hash
from app.database import get_database
from utils import validate_employee_id, handle_database_error
from datetime import datetime

router = APIRouter(prefix="/users", tags=["Users"])

@router.get("/me", response_model=UserOut)
async def get_my_profile(
    current_user: UserInDB = Depends(get_current_active_user)
):
    """
    Get current user's profile
    """
    return UserOut(**current_user.dict())

@router.put("/me", response_model=UserOut)
async def update_my_profile(
    update_data: UserUpdate,
    current_user: UserInDB = Depends(get_current_active_user)
):
    """
    Update current user's profile
    """
    try:
        db = await get_database()
        
        # Build update document
        update_doc = {"updated_at": datetime.utcnow()}
        
        if update_data.name:
            update_doc["name"] = update_data.name
        if update_data.email:
            # Check if email is already taken by another user
            existing_user = await db.users.find_one({
                "email": update_data.email,
                "employee_id": {"$ne": current_user.employee_id}
            })
            if existing_user:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="Email already registered"
                )
            update_doc["email"] = update_data.email
        
        if update_data.department:
            update_doc["department"] = update_data.department.value
        
        # Update user
        await db.users.update_one(
            {"employee_id": current_user.employee_id},
            {"$set": update_doc}
        )
        
        # Get updated user
        updated_user = await db.users.find_one({"employee_id": current_user.employee_id})
        return UserOut(**updated_user)
        
    except HTTPException:
        raise
    except Exception as e:
        raise handle_database_error(e)

@router.get("/", response_model=List[UserOut])
async def get_all_users(
    current_user: UserInDB = Depends(require_admin_role)
):
    """
    Get all users (admin only)
    """
    try:
        db = await get_database()
        users_data = await db.users.find({}).to_list(length=None)
        return [UserOut(**user) for user in users_data]
        
    except Exception as e:
        raise handle_database_error(e)

@router.post("/", response_model=UserOut)
async def create_user(
    user_data: UserCreate,
    current_user: UserInDB = Depends(require_admin_role)
):
    """
    Create new user (admin only)
    """
    try:
        db = await get_database()
        
        # Validate employee ID format
        if not validate_employee_id(user_data.employee_id):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid employee ID format. Use format: E001, E002, etc."
            )
        
        # Check if employee ID already exists
        existing_user = await db.users.find_one({"employee_id": user_data.employee_id})
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Employee ID already exists"
            )
        
        # Check if email already exists
        existing_email = await db.users.find_one({"email": user_data.email})
        if existing_email:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Email already registered"
            )
        
        # Create user document
        user_doc = {
            "employee_id": user_data.employee_id,
            "name": user_data.name,
            "email": user_data.email,
            "password": get_password_hash(user_data.password),
            "role": user_data.role.value,
            "department": user_data.department.value if user_data.department else None,
            "is_active": True,
            "created_at": datetime.utcnow()
        }
        
        # Insert user
        await db.users.insert_one(user_doc)
        
        # Initialize user stats
        await db.user_stats.insert_one({
            "user_id": user_data.employee_id,
            "user_name": user_data.name,
            "points": 0,
            "reports_submitted": 0,
            "reports_resolved": 0
        })
        
        return UserOut(**user_doc)
        
    except HTTPException:
        raise
    except Exception as e:
        raise handle_database_error(e)

@router.get("/{employee_id}", response_model=UserOut)
async def get_user(
    employee_id: str,
    current_user: UserInDB = Depends(get_current_active_user)
):
    """
    Get user by employee ID
    
    Users can view their own profile, admins can view any profile
    """
    try:
        # Check permissions
        if employee_id != current_user.employee_id and current_user.role not in ["admin", "super_admin"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Can only view own profile unless admin"
            )
        
        db = await get_database()
        user_data = await db.users.find_one({"employee_id": employee_id})
        
        if not user_data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        return UserOut(**user_data)
        
    except HTTPException:
        raise
    except Exception as e:
        raise handle_database_error(e)

@router.put("/{employee_id}", response_model=UserOut)
async def update_user(
    employee_id: str,
    update_data: UserUpdate,
    current_user: UserInDB = Depends(require_admin_role)
):
    """
    Update user (admin only)
    """
    try:
        db = await get_database()
        
        # Check if user exists
        existing_user = await db.users.find_one({"employee_id": employee_id})
        if not existing_user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Build update document
        update_doc = {"updated_at": datetime.utcnow()}
        
        if update_data.name:
            update_doc["name"] = update_data.name
        if update_data.email:
            # Check if email is already taken by another user
            email_conflict = await db.users.find_one({
                "email": update_data.email,
                "employee_id": {"$ne": employee_id}
            })
            if email_conflict:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="Email already registered"
                )
            update_doc["email"] = update_data.email
        
        if update_data.role:
            update_doc["role"] = update_data.role.value
        if update_data.department:
            update_doc["department"] = update_data.department.value
        
        # Update user
        await db.users.update_one(
            {"employee_id": employee_id},
            {"$set": update_doc}
        )
        
        # Update user stats if name changed
        if update_data.name:
            await db.user_stats.update_one(
                {"user_id": employee_id},
                {"$set": {"user_name": update_data.name}},
                upsert=True
            )
        
        # Get updated user
        updated_user = await db.users.find_one({"employee_id": employee_id})
        return UserOut(**updated_user)
        
    except HTTPException:
        raise
    except Exception as e:
        raise handle_database_error(e)

@router.delete("/{employee_id}", response_model=MessageResponse)
async def delete_user(
    employee_id: str,
    current_user: UserInDB = Depends(require_admin_role)
):
    """
    Delete user (admin only)
    """
    try:
        # Prevent self-deletion
        if employee_id == current_user.employee_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot delete own account"
            )
        
        db = await get_database()
        
        # Delete user
        result = await db.users.delete_one({"employee_id": employee_id})
        
        if result.deleted_count == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Clean up user stats
        await db.user_stats.delete_one({"user_id": employee_id})
        
        return MessageResponse(
            message=f"User {employee_id} deleted successfully",
            success=True
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise handle_database_error(e)

@router.post("/{employee_id}/deactivate", response_model=MessageResponse)
async def deactivate_user(
    employee_id: str,
    current_user: UserInDB = Depends(require_admin_role)
):
    """
    Deactivate user account (admin only)
    """
    try:
        # Prevent self-deactivation
        if employee_id == current_user.employee_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot deactivate own account"
            )
        
        db = await get_database()
        
        result = await db.users.update_one(
            {"employee_id": employee_id},
            {"$set": {"is_active": False, "updated_at": datetime.utcnow()}}
        )
        
        if result.matched_count == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        return MessageResponse(
            message=f"User {employee_id} deactivated successfully",
            success=True
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise handle_database_error(e)

@router.post("/{employee_id}/activate", response_model=MessageResponse)
async def activate_user(
    employee_id: str,
    current_user: UserInDB = Depends(require_admin_role)
):
    """
    Activate user account (admin only)
    """
    try:
        db = await get_database()
        
        result = await db.users.update_one(
            {"employee_id": employee_id},
            {"$set": {"is_active": True, "updated_at": datetime.utcnow()}}
        )
        
        if result.matched_count == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        return MessageResponse(
            message=f"User {employee_id} activated successfully",
            success=True
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise handle_database_error(e)
