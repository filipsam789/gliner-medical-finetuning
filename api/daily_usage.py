from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy import Column, Integer, String, Date, Index, func
from sqlalchemy.orm import declarative_base, sessionmaker
import os
from datetime import date, datetime, timedelta
from utils import get_user_from_token
from experiments import SessionLocal, Base

DAILY_USAGE_TABLE_NAME = "daily_usage"

class DailyUsage(Base):
    __tablename__ = DAILY_USAGE_TABLE_NAME
    __table_args__ = {"schema": "experiments"}
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, nullable=False)
    usage_date = Column(Date, nullable=False)
    usage_count = Column(Integer, default=0, nullable=False)
    
    __table_args__ = (
        Index('idx_user_date', 'user_id', 'usage_date'),
        {"schema": "experiments"}
    )

Base.metadata.create_all(bind=SessionLocal.kw['bind'])

router = APIRouter()

def get_user_usage_today(user_id: str) -> int:
    """Get today's usage count for a user"""
    session = SessionLocal()
    try:
        today = date.today()
        usage_record = session.query(DailyUsage).filter(
            DailyUsage.user_id == user_id,
            DailyUsage.usage_date == today
        ).first()
        
        return usage_record.usage_count if usage_record else 0
    finally:
        session.close()

def increment_user_usage(user_id: str) -> int:
    """Increment today's usage count for a user and return new count"""
    session = SessionLocal()
    try:
        today = date.today()
        usage_record = session.query(DailyUsage).filter(
            DailyUsage.user_id == user_id,
            DailyUsage.usage_date == today
        ).first()
        
        if usage_record:
            usage_record.usage_count += 1
            new_count = usage_record.usage_count
        else:
            new_record = DailyUsage(
                user_id=user_id,
                usage_date=today,
                usage_count=1
            )
            session.add(new_record)
            new_count = 1
        
        session.commit()
        return new_count
    finally:
        session.close()

def cleanup_old_usage_records():
    """Delete usage records from the previous day"""
    session = SessionLocal()
    try:
        yesterday = date.today() - timedelta(days=1)
        deleted_count = session.query(DailyUsage).filter(
            DailyUsage.usage_date <= yesterday
        ).delete()
        session.commit()
        return deleted_count
    finally:
        session.close()

@router.get("/usage-status")
async def get_usage_status(request: Request):
    """Get current usage status for the authenticated user"""
    try:
        user_details = get_user_from_token(request)
        user_id = user_details["id"]
        user_roles = user_details.get("roles", [])
        
        if "premium_user" in user_roles:
            return {
                "is_premium": True,
                "daily_limit": None,
                "used_today": 0,
                "remaining": None
            }
        
        used_today = get_user_usage_today(user_id)
        daily_limit = 5
        remaining = max(0, daily_limit - used_today)
        
        return {
            "is_premium": False,
            "daily_limit": daily_limit,
            "used_today": used_today,
            "remaining": remaining
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get usage status: {str(e)}")

@router.post("/cleanup-usage")
async def cleanup_usage_records():
    """Cleanup usage records from previous day (for admin/scheduled tasks)"""
    try:
        deleted_count = cleanup_old_usage_records()
        return {
            "message": f"Cleaned up {deleted_count} usage records from previous day",
            "deleted_count": deleted_count
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to cleanup usage records: {str(e)}")
