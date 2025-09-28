from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy import Column, Integer, String, Text, Boolean, Float, TIMESTAMP, ForeignKey
from sqlalchemy.orm import declarative_base
from experiments import SessionLocal, Base
from utils import premium_user_required
from datetime import datetime

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


@router.post("/experiments/{experiment_id}/runs")
async def add_experiment_run(experiment_id: int, data: dict, request: Request, user=Depends(premium_user_required)):
    model = data.get("model")
    labels_to_extract = data.get("labels_to_extract")
    allow_multilabeling = data.get("allow_multilabeling")
    threshold = data.get("threshold") or None
    if not model or labels_to_extract is None or allow_multilabeling is None:
        raise HTTPException(status_code=400, detail="Missing required fields")
    session = SessionLocal()
    run = ExperimentRun(
        model=model,
        labels_to_extract=labels_to_extract,
        allow_multilabeling=allow_multilabeling,
        threshold=threshold,
        experiment_id=experiment_id,
        date_ran=datetime.utcnow()
    )
    session.add(run)
    session.commit()
    session.refresh(run)
    run_id = run.id
    session.close()
    session = SessionLocal()
    from documents import Document
    docs = session.query(Document).filter(Document.experiment_id == experiment_id).all()
    session.close()
    texts = [d.text for d in docs]
    doc_ids = [d.id for d in docs]
    from helpers import predict_entities_batch, initialize_mongodb
    predictions = predict_entities_batch(model, labels_to_extract, texts, threshold, allow_multilabeling)
    results = []
    for doc_id, preds in zip(doc_ids, predictions):
        results.append({"predictions": preds, "document_id": doc_id})
    mongo_client = initialize_mongodb()
    mongo_client.database.ExperimentResults.insert_one({
        "experiment_run_id": run_id,
        "results": results
    })
    return {
        "id": run_id,
        "date_ran": run.date_ran,
        "model": run.model,
        "threshold": run.threshold if "gliner" in run.model.lower() else None,
        "labels_to_extract": run.labels_to_extract,
        "allow_multilabeling": run.allow_multilabeling,
        "results": results
    }