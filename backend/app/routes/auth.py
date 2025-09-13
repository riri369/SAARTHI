from fastapi import APIRouter, HTTPException, status, Depends
from datetime import timedelta
from app.models import LoginRequest, LoginResponse, UserOut, Token, MessageResponse
from app.auth import authenticate_user, create_access_token, get_current_active_user
from app.config import settings

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/login", response_model=LoginResponse)
async def login(login_data: LoginRequest):
    """
    Employee login endpoint
    
    Authenticates employee with ID and password, returns JWT token
    """
    user = await authenticate_user(login_data.employee_id, login_data.password)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid employee ID or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Create access token
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.employee_id}, 
        expires_delta=access_token_expires
    )
    
    return LoginResponse(
        access_token=access_token,
        token_type="bearer",
        user=UserOut(**user.dict())
    )

@router.post("/logout", response_model=MessageResponse)
async def logout(current_user: UserOut = Depends(get_current_active_user)):
    """
    Logout endpoint (client-side token removal)
    
    Note: JWT tokens are stateless, so logout is handled client-side
    by removing the token. This endpoint just confirms the action.
    """
    return MessageResponse(
        message=f"Successfully logged out {current_user.name}",
        success=True
    )

@router.get("/me", response_model=UserOut)
async def get_current_user_profile(current_user: UserOut = Depends(get_current_active_user)):
    """
    Get current user profile information
    
    Returns the profile data of the currently authenticated user
    """
    return current_user

@router.post("/verify-token", response_model=UserOut)
async def verify_token(current_user: UserOut = Depends(get_current_active_user)):
    """
    Verify if the provided token is valid
    
    Returns user data if token is valid, otherwise returns 401
    """
    return current_user