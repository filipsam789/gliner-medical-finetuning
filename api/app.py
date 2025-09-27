from fastapi import FastAPI, HTTPException, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from helpers import get_model, parse_entity_types, store_training_text
from custom_types import EntityRequest
import constants
from utils import get_keycloak_admin_token, assign_role_to_user, get_user_from_token

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=constants.ALLOWED_FRONTEND_URLS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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

@app.post("/subscribe")
async def subscribe(request: Request):
    """Assign premium_user role to the authenticated user"""
    try:
        user_details = get_user_from_token(request)
        user_id = user_details["id"]
        
        result = assign_role_to_user(user_id, "premium_user")
        
        return {
            "message": "premium_user role assigned successfully",
            "user": user_details["email"],
            "role": "premium_user"
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to subscribe user: {str(e)}")

@app.get("/premium-content")
async def premium_content(request: Request):
    """Premium content that only premium_user role can access"""
    try:
        user_details = get_user_from_token(request)
        user_roles = user_details.get("roles", [])
        
        if "premium_user" not in user_roles:
            raise HTTPException(status_code=403, detail="Access denied: Premium subscription required")
        
        return {
            "message": "Welcome to Premium Content!",
            "content": "This is exclusive premium content only for premium users.",
            "user": user_details["email"],
            "features": [
                "Advanced AI Models",
                "Unlimited API Calls",
                "Priority Support",
                "Custom Training Data"
            ]
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get premium content: {str(e)}")

@app.get("/regular-content")
async def regular_content(request: Request):
    """Regular content that only regular_user role can access"""
    try:
        user_details = get_user_from_token(request)
        user_roles = user_details.get("roles", [])
        
        if "regular_user" not in user_roles:
            raise HTTPException(status_code=403, detail="Access denied: Regular user access required")
        
        return {
            "message": "Welcome to Regular User Content!",
            "content": "This is content for regular users.",
            "user": user_details["email"],
            "features": [
                "Basic AI Models",
                "Limited API Calls (100/day)",
                "Community Support",
                "Standard Features"
            ]
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get regular content: {str(e)}")
    
@app.get("/")
async def health():
    return {"status": "online"}

