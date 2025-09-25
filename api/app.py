import requests
from fastapi import FastAPI, HTTPException, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from helpers import get_model, parse_entity_types, store_training_text
from custom_types import EntityRequest
import constants
from dotenv import load_dotenv
import jwt
from jwt.exceptions import InvalidTokenError
import os
from fastapi_keycloak import FastAPIKeycloak, OIDCUser

app = FastAPI()

load_dotenv()

KEYCLOAK_SERVER_URL = os.getenv("KEYCLOAK_SERVER_URL")
KEYCLOAK_REALM = os.getenv("KEYCLOAK_REALM")
KEYCLOAK_CLIENT_ID = os.getenv("KEYCLOAK_CLIENT_ID")
KEYCLOAK_ADMIN_USER = os.getenv("KEYCLOAK_ADMIN_USER")
KEYCLOAK_ADMIN_PASSWORD = os.getenv("KEYCLOAK_ADMIN_PASSWORD")

idp = FastAPIKeycloak(
    server_url=KEYCLOAK_SERVER_URL,
    client_id=KEYCLOAK_CLIENT_ID,
    client_secret=None,
    admin_client_secret=None,
    realm=KEYCLOAK_REALM,
    callback_uri="http://localhost:8080/callback"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=constants.ALLOWED_FRONTEND_URLS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_user_from_token(request: Request):
    authorization = request.headers.get("Authorization")
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Authorization header missing or invalid")
    
    token = authorization.split(" ")[1]
    
    try:
        decoded_token = jwt.decode(token, options={"verify_signature": False})
        
        email = decoded_token.get("email")
        if not email:
            raise HTTPException(status_code=401, detail="Email address not found in token")
        
        user_details = {
            "email": email,
            "username": decoded_token.get("preferred_username"),
            "firstName": decoded_token.get("given_name"),
            "lastName": decoded_token.get("family_name"),
            "id": decoded_token.get("sub"),
            "roles": decoded_token.get("realm_access", {}).get("roles", [])
        }
        
        return user_details
        
    except InvalidTokenError:
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

@app.post("/subscribe")
async def subscribe(user: OIDCUser = Depends(idp.get_current_user)):
    try:
        # user.sub contains the user ID
        user_id = user.sub
        # Assign the "premium_user" role
        idp.assign_client_role_to_user(
            user_id=user_id,
            client_id="test-client",
            role_name="premium_user"
        )
        return {"message": "premium_user role assigned successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to assign role: {str(e)}")
    
@app.get("/callback", tags=["auth-flow"])
def callback(session_state: str, code: str):
    return idp.exchange_authorization_code(session_state=session_state, code=code)

@app.get("/")
async def health():
    return {"status": "online"}

