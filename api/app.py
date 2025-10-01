from fastapi import FastAPI, HTTPException, Depends, Request, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
import asyncio
from helpers import get_model, parse_entity_types, store_training_text
from custom_types import EntityRequest
import constants
from utils import get_keycloak_admin_token, assign_role_to_user, get_user_from_token
from daily_usage import get_user_usage_today, increment_user_usage, cleanup_old_usage_records
from experiments import router as experiments_router
from documents import router as documents_router
from experiment_runs import router as experiment_runs_router
from daily_usage import router as daily_usage_router
from subscriptions import router as subscriptions_router

app = FastAPI()

async def cleanup_task():
    """Background task to clean up old usage records"""
    while True:
        try:
            deleted_count = cleanup_old_usage_records()
            print(f"Cleaned up {deleted_count} old usage records")
        except Exception as e:
            print(f"Error during cleanup: {e}")
        
        await asyncio.sleep(24 * 60 * 60)

@app.on_event("startup")
async def startup_event():
    asyncio.create_task(cleanup_task())

app.include_router(experiments_router)
app.include_router(documents_router)
app.include_router(experiment_runs_router)
app.include_router(daily_usage_router)
app.include_router(subscriptions_router)

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
async def predict_entities(req: EntityRequest, request: Request):
    try:
        user_details = get_user_from_token(request)
        user_id = user_details["id"]
        user_roles = user_details.get("roles", [])
        
        if "premium_user" not in user_roles:
            daily_limit = 5
            used_today = get_user_usage_today(user_id)
            
            if used_today >= daily_limit:
                raise HTTPException(
                    status_code=429, 
                    detail=f"Daily limit reached. You have used {used_today}/{daily_limit} extractions today. Upgrade to Premium for unlimited access."
                )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to check usage limits: {str(e)}")

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
        if model == "gemini":
            from gemini_client import get_gemini_client
            gemini_client = get_gemini_client()
            entities = await gemini_client.predict_entities(
                req.text,
                entity_types,
                threshold=req.threshold,
                multi_label=req.allow_multi_labeling,
            )
        else:
            entities = model.predict_entities(
                req.text,
                entity_types,
                threshold=req.threshold,
                multi_label=req.allow_multi_labeling,
            )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Inference error: {e}")

    if req.allowTrainingUse:
        store_training_text(req.text)

    if "premium_user" not in user_roles:
        increment_user_usage(user_id)

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

@app.post("/cleanup-usage")
async def cleanup_usage():
    """Cleanup usage records from previous day (for admin/scheduled tasks)"""
    try:
        deleted_count = cleanup_old_usage_records()
        return {
            "message": f"Cleaned up {deleted_count} usage records from previous day",
            "deleted_count": deleted_count
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to cleanup usage records: {str(e)}")
    
@app.get("/")
async def health():
    return {"status": "online"}

