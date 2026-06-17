from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
from datetime import datetime

class RoleBase(BaseModel):
    roleName: str = Field(..., min_length=2, max_length=100)
    description: Optional[str] = None
    accessLevel: int = Field(default=1, ge=1, le=10)
    authMethod: str = Field(default="jwt", pattern="^(jwt|oauth|api_key)$")
    rateLimit: int = Field(default=100, ge=1, le=10000)
    canExportData: bool = False
    canSubmitData: bool = False
    canManageAPIKeys: bool = False
    canViewAnalytics: bool = False
    extraPermissions: Optional[Dict[str, Any]] = None

class RoleCreate(RoleBase):
    """Schema for creating a new role"""
    pass

class RoleUpdate(BaseModel):
    """Schema for updating a role"""
    roleName: Optional[str] = Field(None, min_length=2, max_length=100)
    description: Optional[str] = None
    accessLevel: Optional[int] = Field(None, ge=1, le=10)
    authMethod: Optional[str] = Field(None, pattern="^(jwt|oauth|api_key)$")
    rateLimit: Optional[int] = Field(None, ge=1, le=10000)
    canExportData: Optional[bool] = None
    canSubmitData: Optional[bool] = None
    canManageAPIKeys: Optional[bool] = None
    canViewAnalytics: Optional[bool] = None
    extraPermissions: Optional[Dict[str, Any]] = None

class RolePermissionUpdate(BaseModel):
    """Schema for updating a single permission"""
    permission_name: str = Field(..., description="Name of the permission to update")
    value: bool = Field(..., description="New value for the permission")

class RoleRateLimitUpdate(BaseModel):
    """Schema for updating rate limit"""
    rate_limit: int = Field(..., ge=1, le=10000, description="New rate limit (requests per minute)")

class RoleInDB(RoleBase):
    """Schema for role response"""
    id: int
    createdAt: datetime
    updatedAt: datetime
    
    class Config:
        from_attributes = True

class RoleResponse(RoleInDB):
    """Schema for role response with additional info"""
    user_count: Optional[int] = None