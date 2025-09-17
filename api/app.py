from fastapi import FastAPI, Request
from pydantic import BaseModel
from typing import List
import json
from fastapi.middleware.cors import CORSMiddleware

# from model_finetuning.model import ContrastiveGLiNER

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8080"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class EntityRequest(BaseModel):
    text: str
    entity_types: str
    threshold: float = 0.5
    allow_multi_label: bool = False
    model: str = "default"

# Load the trained model ONCE at startup for fast inference

# model_path = "contrastive_gliner_model_final"  # Or best_ckpt directory
# model = ContrastiveGLiNER.from_pretrained(model_path)

@app.post("/predict_entities")
async def predict_entities(request: EntityRequest):
    text = request.text
    entity_types = [entity_type.strip() for entity_type in request.entity_types.split(",")]
    threshold = request.threshold

    # entities = model.predict_entities(text, entity_types, threshold=threshold)
    
    # Simulate real response
    return [
            { "text": "Skopje", "label": "GPE", "start": 0, "end": 6, "score": 0.998 },     
            { "text": "the Balkan peninsula", "label": "LOC", "start": 64, "end": 84, "score": 0.7 },
            { "text": "Belgrade", "label": "GPE", "start": 106, "end": 114, "score": 0.5 },
            { "text": "Athens", "label": "GPE", "start": 119, "end": 125, "score": 0.52 },
            { "text": "Skopje", "label": "GPE", "start": 153, "end": 159, "score": 0.6 },         
            { "text": "the Vardar river", "label": "LOC", "start": 218, "end": 234, "score": 0.65 },
            { "text": "the Aegean Sea", "label": "LOC", "start": 253, "end": 267, "score": 0.84 },
            { "text": "Greece", "label": "GPE", "start": 271, "end": 277, "score": 0.59 },
            { "text": "approximately 20 kilometers (12 miles)", "label": "QUANTITY", "start": 293, "end": 331, "score": 0.91 },
            { "text": "North", "label": "LOC", "start": 25, "end": 30, "score": 0.78 },
            { "text": "South", "label": "LOC", "start": 399, "end": 404, "score": 0.63}
            ]

@app.get("/")
async def health():
    return {"status": "online"}

