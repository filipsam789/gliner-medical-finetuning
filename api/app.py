from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from helpers import get_model, parse_entity_types
from custom_types import EntityRequest
import constants

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=constants.ALLOWED_FRONTEND_URLS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/predict_entities")
async def predict_entities(req: EntityRequest):

    try:
        entity_types = parse_entity_types(req.entity_types)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

    try:
        model = get_model(req.model)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to load model: {e}")

    try:
        entities = model.predict_entities(
            req.text,
            entity_types,
            threshold=req.threshold,
            allow_multi_label=req.allow_multi_label,
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Inference error: {e}")

    return entities

@app.get("/")
async def health():
    return {"status": "online"}
