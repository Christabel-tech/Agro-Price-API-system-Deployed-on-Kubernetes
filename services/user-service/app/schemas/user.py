from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime

class UserBase(BaseModel):
    email: EmailStr
    firstName: str
    lastName: str
    phoneNumber: Optional[str] = None
    roleId: Optional[int] = 3

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: int
    email: str
    firstname: str
    lastName: str
    phoneNumber: Optional[str] = None
    roleId: int
    isActive: bool
    createdAt: datetime
    updatedAt: datetime
    
    class Config:
        from_attributes = True

class UserWithRole(UserResponse):
    roleName: Optional[str] = None

class PasswordResetRequest(BaseModel):
    email: EmailStr

class PasswordResetConfirm(BaseModel):
    token: str
    new_password: str = Field(..., min_length=8, description="New password (min 8 characters)")
    confirm_password: str = Field(..., min_length=8, description="Confirm new password")

class AdminUserCreate(BaseModel):
    """Schema for admin creating a user"""
    email: EmailStr
    firstName: str
    lastName: str
    password: str = Field(..., min_length=8)
    phoneNumber: Optional[str] = None
    roleId: int = Field(..., ge=1, le=5, description="Role ID (1-4 only, 5 is not allowed)")
    isActive: bool = True
    
    class Config:
        json_schema_extra = {
            "example": {
                "email": "newuser@example.com",
                "firstName": "John",
                "lastName": "Doe",
                "password": "SecurePass123!",
                "phoneNumber": "+237 654 584 478",
                "roleId": 3,
                "isActive": True
            }
        }

class APIKeyCreate(BaseModel):
    name: str
    rateLimit: Optional[int] = 100
    expiresInDays: Optional[int] = 90

class APIKeyResponse(BaseModel):
    apiKeyId: int
    keyValue: str
    status: str
    rateLimit: int
    expiresAt: Optional[datetime]
    createdAt: datetime
    lastUsedAt: Optional[datetime]
    
    class Config:
        from_attributes = True

class APIKeyListResponse(BaseModel):
    api_keys: List[APIKeyResponse]
    total: int