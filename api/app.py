from fastapi import FastAPI, Request
from pydantic import BaseModel
from typing import List

from model_finetuning.model import ContrastiveGLiNER

app = FastAPI()

class EntityRequest(BaseModel):
    text: str
    entity_types: List[str]
    threshold: float = 0.5

# Load the trained model ONCE at startup for fast inference
model_path = "contrastive_gliner_model_final"  # Or best_ckpt directory
model = ContrastiveGLiNER.from_pretrained(model_path)

@app.post("/predict_entities")
async def predict_entities(request: EntityRequest):
    text = request.text
    entity_types = request.entity_types
    threshold = request.threshold

    entities = model.predict_entities(text, entity_types, threshold=threshold)
    return {"entities": entities}

@app.get("/")
async def health():
    return {"status": "online"}

