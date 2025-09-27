import requests
from fastapi import HTTPException, Request
import os
import jwt
from jwt.exceptions import InvalidTokenError
from dotenv import load_dotenv

load_dotenv()

KEYCLOAK_SERVER_URL = os.getenv("KEYCLOAK_SERVER_URL")
KEYCLOAK_REALM = os.getenv("KEYCLOAK_REALM")
KEYCLOAK_CLIENT_ID = os.getenv("KEYCLOAK_CLIENT_ID")
KEYCLOAK_ADMIN_USER = os.getenv("KEYCLOAK_ADMIN_USER")
KEYCLOAK_ADMIN_PASSWORD = os.getenv("KEYCLOAK_ADMIN_PASSWORD")

async def premium_user_required(request: Request):
    user = get_user_from_token(request)
    if "premium_user" not in user.get("roles", []):
        raise HTTPException(status_code=403, detail="Premium user access required")
    return user

def get_keycloak_admin_token():
    """Get admin access token from Keycloak"""
    token_url = f"{KEYCLOAK_SERVER_URL}/realms/master/protocol/openid-connect/token"
    data = {
        "grant_type": "password",
        "client_id": "admin-cli",
        "username": KEYCLOAK_ADMIN_USER,
        "password": KEYCLOAK_ADMIN_PASSWORD
    }
    try:
        response = requests.post(token_url, data=data)
        response.raise_for_status()
        return response.json()["access_token"]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get admin token: {str(e)}")


def assign_role_to_user(user_id: str, role_name: str):
    """Assign a realm role to a user after removing all existing roles"""
    admin_token = get_keycloak_admin_token()
    headers = {"Authorization": f"Bearer {admin_token}"}
    try:
        current_roles_url = f"{KEYCLOAK_SERVER_URL}/admin/realms/{KEYCLOAK_REALM}/users/{user_id}/role-mappings/realm"
        current_roles_response = requests.get(current_roles_url, headers=headers)
        current_roles_response.raise_for_status()
        current_roles = current_roles_response.json()
        system_roles = ['offline_access', 'uma_authorization', 'default-roles-gliner-realm']
        roles_to_remove = [role for role in current_roles if role['name'] not in system_roles]
        if roles_to_remove:
            print(f"Removing existing roles: {[role['name'] for role in roles_to_remove]}")
            remove_response = requests.delete(current_roles_url, json=roles_to_remove, headers=headers)
            remove_response.raise_for_status()
        role_url = f"{KEYCLOAK_SERVER_URL}/admin/realms/{KEYCLOAK_REALM}/roles/{role_name}"
        role_response = requests.get(role_url, headers=headers)
        role_response.raise_for_status()
        role_data = role_response.json()
        role_payload = [{"id": role_data["id"], "name": role_data["name"]}]
        assign_response = requests.post(current_roles_url, json=role_payload, headers=headers)
        assign_response.raise_for_status()
        removed_role_names = [role['name'] for role in roles_to_remove]
        return {
            "success": True,
            "message": f"Role {role_name} assigned successfully",
            "removed_roles": removed_role_names,
            "assigned_role": role_name
        }
    except requests.exceptions.HTTPError as e:
        if e.response.status_code == 404:
            raise HTTPException(status_code=404, detail=f"Role '{role_name}' or user not found")
        else:
            raise HTTPException(status_code=500, detail=f"Failed to assign role: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error assigning role: {str(e)}")


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
