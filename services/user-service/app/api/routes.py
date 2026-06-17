from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from typing import List, Optional
import jwt
from app.database import get_db
from app.schemas.user import (
    UserCreate, UserLogin, UserResponse, UserWithRole, 
    PasswordResetRequest, PasswordResetConfirm, AdminUserCreate,
    APIKeyCreate, APIKeyResponse, APIKeyListResponse 
)
from app.services.user_service import (
    create_user, get_user_by_email, verify_password, 
    get_user_with_role, get_user_permissions, update_user_password, 
    send_reset_email, get_all_users_with_roles, count_users,
    get_user_by_id, update_user_role_by_admin, deactivate_user, activate_user,
    admin_create_user, delete_user, generate_api_key, get_user_api_keys, 
    revoke_api_key, renew_api_key, get_api_keys_admin, validate_api_key, 
    create_audit_log, get_audit_logs
)
from app.config import settings
from app.api.dependencies import verify_token, get_current_user
from app.models.user import User, Role, APIKey, AuditLog

router = APIRouter(prefix="/api/auth", tags=["auth"])

# ============ API Key Management Endpoints - MUST COME FIRST ============

@router.get("/users/apikeys")
def get_api_keys(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_email: str = Depends(verify_token)
):
    """Get API keys - Developers see only their own, Admins see all"""
    current_user = get_user_by_email(db, current_email)
    if not current_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Only Developers (roleId=4) and Admins (roleId=5) can access API keys
    if current_user.roleId not in [4, 5]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only Developers and Admins can access API keys"
        )
    
    # Admins can see all keys, Developers see only their own
    if current_user.roleId == 5:
        api_keys = get_api_keys_admin(db, skip, limit)
        total = db.query(APIKey).count()
    else:
        api_keys = get_user_api_keys(db, current_user.id)
        total = len(api_keys)
    
    # Mask key values for non-admins
    response_keys = []
    for key in api_keys:
        key_dict = {
            "apiKeyId": key.apiKeyId,
            "keyValue": key.keyValue if current_user.roleId == 5 else key.keyValue[:15] + "...",
            "status": key.status,
            "rateLimit": key.rateLimit,
            "expiresAt": key.expiresAt,
            "createdAt": key.createdAt,
            "lastUsedAt": key.lastUsedAt
        }
        response_keys.append(key_dict)
    
    return APIKeyListResponse(api_keys=response_keys, total=total)
@router.post("/users/apikeys")
def create_api_key(
    key_data: APIKeyCreate,
    db: Session = Depends(get_db),
    current_email: str = Depends(verify_token)
):
    """Create a new API key - Developers can create their own, Admins can create for anyone"""
    current_user = get_user_by_email(db, current_email)
    if not current_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Only Developers (roleId=4) and Admins (roleId=5) can create API keys
    if current_user.roleId not in [4, 5]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only Developers and Admins can create API keys"
        )
    
    # Developers can only create keys for themselves
    # Admins can create for any user (could add user_id parameter)
    user_id = current_user.id
    
    new_key = generate_api_key(
        db=db,
        user_id=user_id,
        name=key_data.name,
        rate_limit=key_data.rateLimit,
        expires_days=key_data.expiresInDays
    )
    
    return {
        "message": "API key created successfully",
        "api_key": new_key.keyValue,
        "apiKeyId": new_key.apiKeyId,
        "name": key_data.name,
        "rateLimit": new_key.rateLimit,
        "expiresAt": new_key.expiresAt
    }

@router.delete("/users/apikeys/{api_key_id}")
def revoke_api_key_endpoint(
    api_key_id: int,
    db: Session = Depends(get_db),
    current_email: str = Depends(verify_token)
):
    """Revoke an API key - Developers can revoke their own, Admins can revoke any"""
    current_user = get_user_by_email(db, current_email)
    if not current_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Only Developers (roleId=4) and Admins (roleId=5) can revoke API keys
    if current_user.roleId not in [4, 5]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only Developers and Admins can revoke API keys"
        )
    
    api_key = db.query(APIKey).filter(APIKey.apiKeyId == api_key_id).first()
    if not api_key:
        raise HTTPException(status_code=404, detail="API key not found")
    
    # Developers can only revoke their own keys
    if current_user.roleId == 4 and api_key.userId != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only revoke your own API keys"
        )
    
    revoke_api_key(db, api_key_id, api_key.userId)
    return {"message": "API key revoked successfully"}

@router.get("/apikeys/validate")
def validate_api_key_endpoint(
    api_key: str,
    db: Session = Depends(get_db)
):
    """Validate an API key (for other services to check)"""
    valid_key = validate_api_key(db, api_key)
    
    if not valid_key:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired API key"
        )
    
    return {
        "valid": True,
        "user_id": valid_key.userId,
        "rate_limit": valid_key.rateLimit,
        "permissions": ["read:prices", "write:prices"]
    }

# ============ Public Endpoints ============

@router.post("/register", response_model=UserResponse)
def register(user: UserCreate, db: Session = Depends(get_db)):
    """Register a new user"""
    db_user = get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    return create_user(db=db, user=user)

@router.post("/login")
def login(user: UserLogin, db: Session = Depends(get_db)):
    """Login user and return JWT token"""
    db_user = get_user_by_email(db, email=user.email)
    if not db_user or not verify_password(user.password, db_user.passwordHash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )
    
    access_token_expires = timedelta(hours=settings.JWT_EXPIRATION_HOURS)
    expire = datetime.utcnow() + access_token_expires
    to_encode = {
        "sub": user.email, 
        "exp": expire,
        "roleId": db_user.roleId
    }
    encoded_jwt = jwt.encode(
        to_encode,
        settings.JWT_SECRET,
        algorithm=settings.JWT_ALGORITHM
    )
    
    role = db.query(Role).filter(Role.id == db_user.roleId).first()
    
    return {
        "access_token": encoded_jwt, 
        "token_type": "bearer",
        "user": {
            "id": db_user.id,
            "email": db_user.email,
            "firstname": db_user.firstname,
            "lastName": db_user.lastName,
            "roleId": db_user.roleId,
            "roleName": role.roleName if role else "Unknown",
            "isActive": db_user.isActive
        }
    }

@router.post("/logout")
def logout(email: str = Depends(verify_token)):
    """Logout user"""
    return {"message": "Logged out successfully"}

@router.post("/forgot-password")
def forgot_password(request: PasswordResetRequest, db: Session = Depends(get_db)):
    """Request password reset"""
    user = get_user_by_email(db, email=request.email)
    
    reset_token_expires = timedelta(hours=1)
    expire = datetime.utcnow() + reset_token_expires
    to_encode = {"sub": request.email, "exp": expire, "type": "password_reset"}
    reset_token = jwt.encode(
        to_encode, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM
    )
    
    if user:
        send_reset_email(request.email, reset_token)
    
    return {"message": "If your email is registered, you will receive a password reset link"}

@router.post("/reset-password")
def reset_password(request: PasswordResetConfirm, db: Session = Depends(get_db)):
    """Reset password using token"""
    try:
        payload = jwt.decode(
            request.token,
            settings.JWT_SECRET,
            algorithms=[settings.JWT_ALGORITHM]
        )
        
        if payload.get("type") != "password_reset":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid token type"
            )
        
        email = payload.get("sub")
        if not email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid token"
            )
        
        if request.new_password != request.confirm_password:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Passwords do not match"
            )
        
        user = get_user_by_email(db, email=email)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        update_user_password(db, user, request.new_password)
        
        return {"message": "Password reset successfully"}
        
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Token has expired"
        )
    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid token"
        )

@router.get("/me", response_model=UserWithRole)
def get_current_user_info(
    current_email: str = Depends(verify_token),
    db: Session = Depends(get_db)
):
    """Get current user information with role"""
    user, role = get_user_with_role(db, email=current_email)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return UserWithRole(
        id=user.id,
        email=user.email,
        firstname=user.firstname,
        lastName=user.lastName,
        phoneNumber=user.phoneNumber,
        roleId=user.roleId,
        roleName=role.roleName if role else None,
        isActive=user.isActive,
        createdAt=user.createdAt,
        updatedAt=user.updatedAt
    )

@router.get("/me/permissions")
def get_my_permissions(
    current_email: str = Depends(verify_token),
    db: Session = Depends(get_db)
):
    """Get current user's permissions based on role"""
    user = get_user_by_email(db, email=current_email)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    permissions = get_user_permissions(db, user.id)
    return permissions

# ============ Admin User Endpoints ============

@router.get("/users")
def get_all_users(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_email: str = Depends(verify_token)
):
    """Get all users (Admin only)"""
    current_user = get_user_by_email(db, current_email)
    if not current_user or current_user.roleId != 5:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    
    users = get_all_users_with_roles(db, skip=skip, limit=limit)
    
    result = []
    for user, role in users:
        result.append({
            "id": user.id,
            "email": user.email,
            "firstname": user.firstname,
            "lastName": user.lastName,
            "phoneNumber": user.phoneNumber,
            "roleId": user.roleId,
            "roleName": role.roleName,
            "isActive": user.isActive,
            "createdAt": user.createdAt,
            "updatedAt": user.updatedAt
        })
    
    return {
        "users": result,
        "total": count_users(db),
        "skip": skip,
        "limit": limit
    }

@router.get("/users/{user_id}")
def get_user_by_id_admin(
    user_id: int,
    db: Session = Depends(get_db),
    current_email: str = Depends(verify_token)
):
    """Get a specific user by ID (Admin only)"""
    current_user = get_user_by_email(db, current_email)
    if not current_user or current_user.roleId != 5:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    
    user = get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    role = db.query(Role).filter(Role.id == user.roleId).first()
    
    return {
        "id": user.id,
        "email": user.email,
        "firstname": user.firstname,
        "lastName": user.lastName,
        "phoneNumber": user.phoneNumber,
        "roleId": user.roleId,
        "roleName": role.roleName if role else "Unknown",
        "isActive": user.isActive,
        "createdAt": user.createdAt,
        "updatedAt": user.updatedAt
    }

@router.post("/users", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def admin_create_new_user(
    user_data: AdminUserCreate,
    db: Session = Depends(get_db),
    current_email: str = Depends(verify_token)
):
    """Admin creates a new user (Admin only)"""
    current_user = get_user_by_email(db, current_email)
    if not current_user or current_user.roleId != 5:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    
    new_user = admin_create_user(db, user_data.dict(), current_user.id)
    return new_user

@router.put("/users/{user_id}/role")
def admin_update_user_role(
    user_id: int,
    role_id: int,
    db: Session = Depends(get_db),
    current_email: str = Depends(verify_token)
):
    """Update a user's role (Admin only)"""
    current_user = get_user_by_email(db, current_email)
    if not current_user or current_user.roleId != 5:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    
    if current_user.id == user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot change your own role"
        )
    
    user = update_user_role_by_admin(db, user_id, role_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found or role invalid"
        )
    
    return {"message": "User role updated successfully", "user_id": user_id, "new_role_id": role_id}

@router.put("/users/{user_id}/deactivate")
def admin_deactivate_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_email: str = Depends(verify_token)
):
    """Deactivate a user account (Admin only)"""
    current_user = get_user_by_email(db, current_email)
    if not current_user or current_user.roleId != 5:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    
    if current_user.id == user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot deactivate your own account"
        )
    
    user = deactivate_user(db, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return {"message": "User account deactivated successfully", "user_id": user_id}

@router.put("/users/{user_id}/activate")
def admin_activate_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_email: str = Depends(verify_token)
):
    """Activate a user account (Admin only)"""
    current_user = get_user_by_email(db, current_email)
    if not current_user or current_user.roleId != 5:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    
    user = activate_user(db, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return {"message": "User account activated successfully", "user_id": user_id}

@router.delete("/users/{user_id}")
def admin_delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_email: str = Depends(verify_token)
):
    """Delete a user permanently (Admin only)"""
    current_user = get_user_by_email(db, current_email)
    if not current_user or current_user.roleId != 5:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    
    if current_user.id == user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete your own account"
        )
    
    deleted_user = delete_user(db, user_id)
    if not deleted_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return {
        "message": "User deleted successfully",
        "user_id": user_id,
        "deleted_user": {
            "id": deleted_user.id,
            "email": deleted_user.email,
            "name": f"{deleted_user.firstname} {deleted_user.lastName}"
        }
    }

@router.post("/auth/change-password")
def change_password(
    password_data: dict,
    db: Session = Depends(get_db),
    current_email: str = Depends(verify_token)
):
    """Change user password"""
    user = get_user_by_email(db, current_email)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Verify current password
    if not verify_password(password_data.get("current_password"), user.passwordHash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect"
        )
    
    # Check new password length
    new_password = password_data.get("new_password")
    if len(new_password) < 8:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="New password must be at least 8 characters"
        )
    
    # Update password
    update_user_password(db, user, new_password)
    
    return {"message": "Password changed successfully"}