from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy import Column, Integer, String, Text, Boolean, Float, TIMESTAMP, ForeignKey
from sqlalchemy.orm import declarative_base
from experiments import SessionLocal, Base
from utils import premium_user_required

EXPERIMENT_RUNS_TABLE_NAME = "experiment_runs"

class ExperimentRun(Base):
    __tablename__ = EXPERIMENT_RUNS_TABLE_NAME
    __table_args__ = {"schema": "experiments"}
    id = Column(Integer, primary_key=True, index=True)
    model = Column(String, nullable=False)
    labels_to_extract = Column(Text, nullable=False)
    allow_multilabeling = Column(Boolean, nullable=False)
    threshold = Column(Float, nullable=False)
    experiment_id = Column(Integer, ForeignKey("experiments.experiments.id", ondelete="CASCADE"), nullable=False)
    date_ran = Column(TIMESTAMP, nullable=False)

Base.metadata.create_all(bind=SessionLocal.kw['bind'])

router = APIRouter()

@router.get("/experiments/{experiment_id}/runs")
async def list_experiment_runs(experiment_id: int, request: Request, user=Depends(premium_user_required)):
    session = SessionLocal()
    runs = session.query(ExperimentRun).filter(ExperimentRun.experiment_id == experiment_id).order_by(ExperimentRun.date_ran.desc()).all()
    session.close()
    return [{
        "id": r.id,
        "date_ran": r.date_ran,
        "model": r.model,
        "threshold": r.threshold if "gliner" in r.model.lower() else None,
        "labels_to_extract": r.labels_to_extract,
        "allow_multilabeling": r.allow_multilabeling
    } for r in runs]
