from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base
import secrets
from datetime import datetime, timedelta

class Role(Base):
    __tablename__ = "roles"

    id = Column(Integer, primary_key=True, index=True)
    roleName = Column(String, unique=True, nullable=False)
    description = Column(String, nullable=True)
    accessLevel = Column(Integer, nullable=False, default=1)
    authMethod = Column(String, nullable=False, default="jwt")
    rateLimit = Column(Integer, nullable=False, default=100)
    canExportData = Column(Boolean, nullable=False, default=False)
    canSubmitData = Column(Boolean, nullable=False, default=False)
    canManageAPIKeys = Column(Boolean, nullable=False, default=False)
    canViewAnalytics = Column(Boolean, nullable=False, default=False)
    extraPermissions = Column(JSON, nullable=True, default=dict)
    createdAt = Column(DateTime(timezone=True), server_default=func.now())
    updatedAt = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    users = relationship("User", back_populates="role")

    def __repr__(self):
        return f"<Role(id={self.id}, name={self.roleName}, level={self.accessLevel})>"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    firstname = Column(String, nullable=False)
    lastName = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    passwordHash = Column(String, nullable=False)
    phoneNumber = Column(String, nullable=True)
    roleId = Column(Integer, ForeignKey("roles.id"), nullable=False, default=3)
    isActive = Column(Boolean, default=True)
    createdAt = Column(DateTime(timezone=True), server_default=func.now())
    updatedAt = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    role = relationship("Role", back_populates="users")
    api_keys = relationship("APIKey", back_populates="user", cascade="all, delete-orphan")
    audit_logs = relationship("AuditLog", back_populates="user", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<User(id={self.id}, email={self.email}, roleId={self.roleId})>"


class APIKey(Base):
    __tablename__ = "api_keys"

    apiKeyId = Column(Integer, primary_key=True, index=True)
    userId = Column(Integer, ForeignKey("users.id"), nullable=False)
    keyValue = Column(String, unique=True, nullable=False, index=True)
    status = Column(String, default="active")  # active, revoked, expired
    rateLimit = Column(Integer, default=100)  # requests per minute
    expiresAt = Column(DateTime(timezone=True), nullable=True)
    createdAt = Column(DateTime(timezone=True), server_default=func.now())
    lastUsedAt = Column(DateTime(timezone=True), nullable=True)

    # Relationship
    user = relationship("User", back_populates="api_keys")

    # Methods
    def generateApiKey(self):
        """Generate a new API key value"""
        self.keyValue = f"agro_{secrets.token_urlsafe(32)}"
        return self.keyValue

    def revokeApiKey(self):
        """Revoke the API key"""
        self.status = "revoked"
        return self

    def renewApiKey(self, days: int = 90):
        """Renew the API key by extending expiration"""
        self.expiresAt = datetime.utcnow() + timedelta(days=days)
        self.status = "active"
        return self

    def validateApiKey(self) -> bool:
        """Validate if API key is active and not expired"""
        if self.status != "active":
            return False
        if self.expiresAt and datetime.utcnow() > self.expiresAt:
            self.status = "expired"
            return False
        return True

    @classmethod
    def getApiKeyByUser(cls, db, userId: int):
        """Get all API keys for a specific user"""
        return db.query(cls).filter(cls.userId == userId).all()

    def __repr__(self):
        return f"<APIKey(id={self.apiKeyId}, userId={self.userId}, status={self.status})>"


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    action = Column(String, nullable=False)  # CREATE, UPDATE, DELETE, LOGIN, LOGOUT, CREATE_API_KEY, REVOKE_API_KEY, RENEW_API_KEY
    resource = Column(String, nullable=False)  # user, price, crop, market, api_key
    resource_id = Column(Integer, nullable=True)
    details = Column(JSON, nullable=True)
    ip_address = Column(String, nullable=True)
    user_agent = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationship
    user = relationship("User", back_populates="audit_logs")