"""
Authentication router

Exposes simple auth endpoints backed by Supabase. This module keeps thin
handler functions that delegate to the `supabase` client defined in
`constants.py`.

Endpoints:
 - POST /auth/login     -> sign in with email/password
 - GET  /auth/me        -> return the current session/user
 - POST /auth/logout    -> sign out current session
 - POST /auth/signup    -> create a new user
 - GET  /auth/forgot_password -> placeholder
 - GET  /auth/delete_account -> placeholder (should lock/delete account)
"""

from fastapi import APIRouter, HTTPException
from constants import supabase
from pydantic import BaseModel

router = APIRouter(
    prefix="/auth",
    tags=["auth"],
    responses={404: {"description": "Not found"}}
)


# Pydantic model for incoming auth requests
class AuthRequest(BaseModel):
    email: str
    password: str
    full_name: str = ""


async def get_user_id():
    """Return the currently authenticated user's ID or raise 401.

    This helper reads session information from the Supabase client and
    raises an HTTPException if there is no active session.
    """
    try:
        user = supabase.auth.get_user()
        if not user or not user.user:
            raise HTTPException(status_code=401, detail="User not authenticated")
        user_id = user.user.id
        print(f"Retrieved user ID: {user_id}", flush=True)
        return user_id
    except Exception as e:
        print(f"Error getting user ID: {e}", flush=True)
        raise HTTPException(status_code=401, detail="Failed to get user information")


@router.post("/login")
async def login(request: AuthRequest):
    """Authenticate a user and return the Supabase session payload.

    Note: This function delegates to `supabase.auth.sign_in_with_password`.
    """
    try:
        response = supabase.auth.sign_in_with_password(
            {
                "email": request.email,
                "password": request.password,
            }
        )
    except Exception as e:
        # Surface provider errors as HTTP 404 for simplicity
        raise HTTPException(status_code=404, detail=str(e))
    return response


@router.get("/me")
async def me():
    """Return the current authenticated session/user information."""
    return supabase.auth.get_user()


@router.post("/logout")
async def logout():
    """Sign out the current session."""
    response = supabase.auth.sign_out()
    return response


@router.post("/signup")
async def signup(request: AuthRequest):
    """Create a new user in Supabase and set a default role.

    The `options.data` payload stores lightweight profile data.
    """
    new_user = supabase.auth.sign_up(
        {
            "email": request.email,
            "password": request.password,
            "options": {
                "data": {
                    "full_name": request.full_name,
                    "role": 'clinician'
                }
            }
        }
    )
    return new_user


@router.get("/forgot_password")
async def forgot_password():
    # Placeholder endpoint - integrate an email/template flow as needed
    return "forgot password"


@router.get("/delete_account")
async def delete_account():
    # Placeholder - consider implementing account lock instead of delete
    return "deleting account..."