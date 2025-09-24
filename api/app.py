from fastapi import FastAPI, HTTPException, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from helpers import get_model, parse_entity_types, store_training_text
from custom_types import EntityRequest
import constants
from dotenv import load_dotenv
import jwt
import os

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=constants.ALLOWED_FRONTEND_URLS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_user_from_token(request: Request):
    """Extract user details from Keycloak JWT token"""
    authorization = request.headers.get("Authorization")
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Authorization header missing or invalid")
    
    token = authorization.split(" ")[1]
    
    try:
        # Decode JWT token without verification for now (in production, verify with Keycloak public key)
        decoded_token = jwt.decode(token, options={"verify_signature": False})
        
        email = decoded_token.get("email")
        if not email:
            raise HTTPException(status_code=401, detail="Email address not found in token")
        
        # Extract other user details from token
        user_details = {
            "email": email,
            "username": decoded_token.get("preferred_username"),
            "firstName": decoded_token.get("given_name"),
            "lastName": decoded_token.get("family_name"),
            "id": decoded_token.get("sub"),
            "roles": decoded_token.get("realm_access", {}).get("roles", [])
        }
        
        return user_details
        
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Token processing error: {str(e)}")

@app.get("/get_user")
async def get_user(request: Request):
    """Get logged in user details from JWT token"""
    try:
        user_details = get_user_from_token(request)
        return user_details
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get user details: {str(e)}")

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

    if req.allowTrainingUse:
        store_training_text(req.text)

    return entities

@app.get("/")
async def health():
    return {"status": "online"}
