from sqlalchemy.orm import Session
from app.models.user import User, Role, APIKey, AuditLog
from app.schemas.user import UserCreate
from app.utils.auth import hash_password as hash_pwd, verify_password as verify_pwd
from fastapi import HTTPException, status
from datetime import datetime, timedelta
import logging
import secrets

logger = logging.getLogger(__name__)

# ============ User Management Functions ============

def create_user(db: Session, user: UserCreate):
    """Create a new user with role validation"""
    role_id = user.roleId if user.roleId else 3
    
    if role_id == 5:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin role cannot be selected during registration"
        )
    
    role = db.query(Role).filter(Role.id == role_id).first()
    if not role:
        role_id = 3
        role = db.query(Role).filter(Role.id == role_id).first()
        if not role:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Default role not found"
            )
    
    hashed_password = hash_pwd(user.password)
    db_user = User(
        firstname=user.firstName,
        lastName=user.lastName,
        email=user.email,
        passwordHash=hashed_password,
        phoneNumber=user.phoneNumber,
        roleId=role_id,
        isActive=True
    )
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    logger.info(f"User created: {db_user.email} with role: {role.roleName}")
    return db_user

def admin_create_user(db: Session, user_data: dict, created_by_admin_id: int):
    """Admin creates a new user"""
    existing_user = db.query(User).filter(User.email == user_data["email"]).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    role_id = user_data.get("roleId", 3)
    if role_id == 5:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot create another admin user"
        )
    
    role = db.query(Role).filter(Role.id == role_id).first()
    if not role:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Role with ID {role_id} not found"
        )
    
    hashed_password = hash_pwd(user_data["password"])
    db_user = User(
        firstname=user_data["firstName"],
        lastName=user_data["lastName"],
        email=user_data["email"],
        passwordHash=hashed_password,
        phoneNumber=user_data.get("phoneNumber"),
        roleId=role_id,
        isActive=user_data.get("isActive", True)
    )
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    logger.info(f"Admin created user: {db_user.email}")
    return db_user

def get_user_by_email(db: Session, email: str):
    """Get user by email"""
    return db.query(User).filter(User.email == email).first()

def get_user_by_id(db: Session, user_id: int):
    """Get user by ID"""
    return db.query(User).filter(User.id == user_id).first()

def get_user_with_role(db: Session, email: str):
    """Get user with role information"""
    return db.query(User, Role).join(Role, User.roleId == Role.id).filter(
        User.email == email
    ).first()

def get_user_permissions(db: Session, user_id: int):
    """Get user's permissions based on their role"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        return None
    
    role = db.query(Role).filter(Role.id == user.roleId).first()
    if not role:
        return None
    
    return {
        "roleId": role.id,
        "roleName": role.roleName,
        "accessLevel": role.accessLevel,
        "canExportData": role.canExportData,
        "canSubmitData": role.canSubmitData,
        "canManageAPIKeys": role.canManageAPIKeys,
        "canViewAnalytics": role.canViewAnalytics,
        "rateLimit": role.rateLimit,
        "extraPermissions": role.extraPermissions
    }

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify password"""
    return verify_pwd(plain_password, hashed_password)

def update_user_password(db: Session, user: User, new_password: str):
    """Update user's password"""
    user.passwordHash = hash_pwd(new_password)
    db.commit()
    db.refresh(user)
    return user

def update_user_role_by_admin(db: Session, user_id: int, new_role_id: int):
    """Update user's role (Admin only)"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        return None
    
    role = db.query(Role).filter(Role.id == new_role_id).first()
    if not role:
        return None
    
    user.roleId = new_role_id
    db.commit()
    db.refresh(user)
    return user

def deactivate_user(db: Session, user_id: int):
    """Deactivate a user account"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        return None
    user.isActive = False
    db.commit()
    db.refresh(user)
    return user

def activate_user(db: Session, user_id: int):
    """Activate a user account"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        return None
    user.isActive = True
    db.commit()
    db.refresh(user)
    return user

def delete_user(db: Session, user_id: int):
    """Delete a user from database (Admin only)"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        return None
    user_email = user.email
    db.delete(user)
    db.commit()
    logger.info(f"Admin deleted user: {user_email}")
    return user

def get_all_users_with_roles(db: Session, skip: int = 0, limit: int = 100):
    """Get all users with their role information"""
    return db.query(User, Role).join(Role, User.roleId == Role.id).offset(skip).limit(limit).all()

def count_users(db: Session):
    """Get total number of users"""
    return db.query(User).count()

def send_reset_email(email: str, reset_token: str):
    """Send password reset email"""
    print(f"\n=== PASSWORD RESET ===")
    print(f"Email: {email}")
    print(f"Reset link: http://localhost:3000/reset-password?token={reset_token}")
    print(f"=====================\n")

# ============ API Key Functions ============

def generate_api_key(db: Session, user_id: int, name: str, rate_limit: int = 100, expires_days: int = 90):
    """Generate a new API key for a user"""
    new_key = APIKey(
        userId=user_id,
        keyValue=f"agro_{secrets.token_urlsafe(32)}",
        status="active",
        rateLimit=rate_limit,
        expiresAt=datetime.utcnow() + timedelta(days=expires_days)
    )
    
    db.add(new_key)
    db.commit()
    db.refresh(new_key)
    
    # Log the action
    create_audit_log(
        db=db,
        user_id=user_id,
        action="CREATE_API_KEY",
        resource="api_key",
        resource_id=new_key.apiKeyId,
        details={"name": name, "rate_limit": rate_limit}
    )
    
    return new_key

def get_user_api_keys(db: Session, user_id: int):
    """Get all API keys for a user"""
    return db.query(APIKey).filter(APIKey.userId == user_id).all()

def get_api_keys_admin(db: Session, skip: int = 0, limit: int = 100):
    """Get all API keys (Admin only)"""
    return db.query(APIKey).offset(skip).limit(limit).all()

def revoke_api_key(db: Session, api_key_id: int, user_id: int):
    """Revoke an API key"""
    api_key = db.query(APIKey).filter(APIKey.apiKeyId == api_key_id, APIKey.userId == user_id).first()
    if not api_key:
        return None
    
    api_key.revokeApiKey()
    db.commit()
    
    create_audit_log(
        db=db,
        user_id=user_id,
        action="REVOKE_API_KEY",
        resource="api_key",
        resource_id=api_key_id,
        details={"key_status": "revoked"}
    )
    
    return api_key

def renew_api_key(db: Session, api_key_id: int, user_id: int, days: int = 90):
    """Renew an API key"""
    api_key = db.query(APIKey).filter(APIKey.apiKeyId == api_key_id, APIKey.userId == user_id).first()
    if not api_key:
        return None
    
    api_key.renewApiKey(days)
    db.commit()
    
    create_audit_log(
        db=db,
        user_id=user_id,
        action="RENEW_API_KEY",
        resource="api_key",
        resource_id=api_key_id,
        details={"extended_days": days}
    )
    
    return api_key

def validate_api_key(db: Session, key_value: str):
    """Validate an API key for API access"""
    api_key = db.query(APIKey).filter(APIKey.keyValue == key_value).first()
    if not api_key:
        return None
    
    if not api_key.validateApiKey():
        db.commit()
        return None
    
    api_key.lastUsedAt = datetime.utcnow()
    db.commit()
    return api_key

# ============ Audit Log Functions ============

def create_audit_log(db: Session, user_id: int, action: str, resource: str, 
                     resource_id: int = None, details: dict = None, 
                     ip_address: str = None, user_agent: str = None):
    """Create an audit log entry"""
    log = AuditLog(
        user_id=user_id,
        action=action,
        resource=resource,
        resource_id=resource_id,
        details=details,
        ip_address=ip_address,
        user_agent=user_agent
    )
    db.add(log)
    db.commit()
    return log

def get_audit_logs(db: Session, user_id: int = None, skip: int = 0, limit: int = 100):
    """Get audit logs (Admin only)"""
    query = db.query(AuditLog)
    if user_id:
        query = query.filter(AuditLog.user_id == user_id)
    return query.order_by(AuditLog.created_at.desc()).offset(skip).limit(limit).all()