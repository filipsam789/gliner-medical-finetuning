from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy import create_engine, Column, Integer, String, select
from sqlalchemy.orm import declarative_base, sessionmaker
import os
import random
from constants import EXPERIMENT_IMAGE_URLS
from utils import premium_user_required

EXPERIMENTS_TABLE_NAME = "experiments"
DATABASE_URL = os.getenv("POSTGRES_URL")

engine = create_engine(DATABASE_URL, pool_pre_ping=True)

Base = declarative_base()
SessionLocal = sessionmaker(bind=engine)

class Experiment(Base):
    __tablename__ = EXPERIMENTS_TABLE_NAME
    __table_args__ = {"schema": "experiments"}
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    image_url = Column(String, nullable=False)
    user_id = Column(String, nullable=False)

Base.metadata.create_all(bind=engine)

router = APIRouter()

@router.get("/experiments")
async def list_experiments(request: Request, user=Depends(premium_user_required)):
    session = SessionLocal()
    experiments = session.query(Experiment).filter(Experiment.user_id == user["id"]).all()
    session.close()
    return [{"id": e.id, "name": e.name, "image_url": e.image_url} for e in experiments]

@router.post("/experiments")
async def create_experiment(data: dict, request: Request, user=Depends(premium_user_required)):
    name = data.get("name")
    if not name:
        raise HTTPException(status_code=400, detail="Experiment name required")
    
    custom_image_url = data.get("image_url")
    image_url = custom_image_url if custom_image_url else random.choice(EXPERIMENT_IMAGE_URLS)
    
    session = SessionLocal()
    experiment = Experiment(name=name, image_url=image_url, user_id=user["id"])
    session.add(experiment)
    session.commit()
    session.refresh(experiment)
    session.close()
    return {"id": experiment.id, "name": experiment.name, "image_url": experiment.image_url}

@router.delete("/experiments/{experiment_id}")
async def delete_experiment(experiment_id: int, request: Request, user=Depends(premium_user_required)):
    session = SessionLocal()
    experiment = session.query(Experiment).filter(Experiment.id == experiment_id, Experiment.user_id == user["id"]).first()
    if not experiment:
        session.close()
        raise HTTPException(status_code=404, detail="Experiment not found or not owned by user")
    session.delete(experiment)
    session.commit()
    session.close()
    return {"success": True, "message": "Experiment deleted"}
