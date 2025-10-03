from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy import Column, Integer, String, Text, ForeignKey, TIMESTAMP, Boolean, Float
from sqlalchemy.orm import declarative_base, sessionmaker, relationship
import os
import random
from constants import DOCUMENT_IMAGE_URLS
from utils import premium_user_required
from experiments import SessionLocal, Base, Experiment

DOCUMENTS_TABLE_NAME = "documents"

class Document(Base):
    __tablename__ = DOCUMENTS_TABLE_NAME
    __table_args__ = {"schema": "experiments"}
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    text = Column(Text, nullable=False)
    date_added = Column(TIMESTAMP, nullable=False)
    image_url = Column(String, nullable=True)
    experiment_id = Column(Integer, ForeignKey("experiments.experiments.id", ondelete="CASCADE"), nullable=False)

Base.metadata.create_all(bind=SessionLocal.kw['bind'])

router = APIRouter()

@router.get("/experiments/{experiment_id}/documents")
async def list_documents(experiment_id: int, request: Request, user=Depends(premium_user_required)):
    session = SessionLocal()
    experiment = session.query(Experiment).filter(Experiment.id == experiment_id).first()
    if not experiment:
        session.close()
        raise HTTPException(status_code=404, detail="Experiment not found")
    docs = session.query(Document).filter(Document.experiment_id == experiment_id).all()
    documents = [{"id": d.id, "title": d.title, "text": d.text, "date_added": d.date_added, "image_url": d.image_url} for d in docs]
    session.close()
    return {
        "experiment": {
            "id": experiment.id,
            "name": experiment.name,
            "image_url": experiment.image_url
        },
        "documents": documents
    }

@router.post("/experiments/{experiment_id}/documents")
async def add_document(experiment_id: int, data: dict, request: Request, user=Depends(premium_user_required)):
    title = data.get("title")
    text = data.get("text")
    if not title or not text:
        raise HTTPException(status_code=400, detail="Title and text required")
    
    custom_image_url = data.get("image_url")
    image_url = custom_image_url if custom_image_url else random.choice(DOCUMENT_IMAGE_URLS)
    
    from datetime import datetime
    session = SessionLocal()
    doc = Document(title=title, text=text, date_added=datetime.utcnow(), image_url=image_url, experiment_id=experiment_id)
    session.add(doc)
    session.commit()
    session.refresh(doc)
    session.close()
    return {"id": doc.id, "title": doc.title, "text": doc.text, "date_added": doc.date_added, "image_url": doc.image_url}


@router.get("/documents/{document_id}")
async def get_document(document_id: int, request: Request, user=Depends(premium_user_required)):
    session = SessionLocal()
    doc = session.query(Document).filter(Document.id == document_id).first()
    if not doc:
        session.close()
        raise HTTPException(status_code=404, detail="Document not found")
    document_data = {
        "id": doc.id,
        "title": doc.title,
        "text": doc.text,
        "date_added": doc.date_added,
        "image_url": doc.image_url,
        "experiment_id": doc.experiment_id
    }
    session.close()
    return document_data

@router.delete("/documents/{document_id}")
async def delete_document(document_id: int, request: Request, user=Depends(premium_user_required)):
    session = SessionLocal()
    doc = session.query(Document).filter(Document.id == document_id).first()
    if not doc:
        session.close()
        raise HTTPException(status_code=404, detail="Document not found")
    session.delete(doc)
    session.commit()
    session.close()
    return {"success": True, "message": "Document deleted"}
