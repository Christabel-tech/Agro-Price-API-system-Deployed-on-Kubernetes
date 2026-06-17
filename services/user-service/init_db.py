# init_db.py
#!/usr/bin/env python
"""Initialize database with tables and default roles"""

from app.database import engine, Base
from app.models.user import User, Role
from sqlalchemy.orm import sessionmaker
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def init_database():
    """Create tables and seed default roles"""
    
    # Create all tables
    logger.info("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    logger.info("Tables created successfully!")
    
    # Seed roles
    SessionLocal = sessionmaker(bind=engine)
    db = SessionLocal()
    
    try:
        # Check if roles already exist
        if db.query(Role).count() == 0:
            default_roles = [
                Role(id=1, roleName="Trader", description="Agricultural trader who buys and sells products",
                     accessLevel=3, canSubmitData=True, canViewAnalytics=True, rateLimit=200),
                Role(id=2, roleName="Policymaker", description="Government official or policy maker",
                     accessLevel=8, canExportData=True, canViewAnalytics=True, rateLimit=500),
                Role(id=3, roleName="Consumer", description="Regular consumer of agricultural products",
                     accessLevel=1, rateLimit=100),
                Role(id=4, roleName="Developer", description="API Developer building applications",
                     accessLevel=5, canManageAPIKeys=True, canViewAnalytics=True, rateLimit=1000),
                Role(id=5, roleName="Administrator", description="System administrator (internal use)",
                     accessLevel=10, canExportData=True, canSubmitData=True, 
                     canManageAPIKeys=True, canViewAnalytics=True, rateLimit=5000),
            ]
            
            for role in default_roles:
                db.add(role)
                logger.info(f"Added role: {role.roleName}")
            
            db.commit()
            logger.info("Default roles seeded successfully!")
        else:
            logger.info("Roles already exist, skipping seed...")
        
        # Display roles
        roles = db.query(Role).all()
        logger.info("\n=== Available Roles ===")
        for role in roles:
            logger.info(f"ID: {role.id} - {role.roleName}: {role.description}")
            
    except Exception as e:
        logger.error(f"Error initializing database: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    init_database()