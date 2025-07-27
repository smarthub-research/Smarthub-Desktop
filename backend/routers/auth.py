from fastapi import APIRouter
from constants import supabase
from pydantic import BaseModel

router = APIRouter(
    prefix="/auth",
    tags=["auth"],
    responses={404: {"description": "Not found"}}
)

# Struct for login data model
class AuthRequest(BaseModel):
    email: str
    password: str

# Logs a user in and sends the JWT for the session
@router.get("/login")
async def login(request: AuthRequest):
    response = supabase.auth.sign_in_with_password(
        {
            "email": request.email,
            "password": request.password,
        }
    )
    return response

# Logs the user out and deletes their current session in supabase
@router.get("/logout")
async def logout():
    response = supabase.auth.sign_out()
    return response

# Creates a new user in the db
@router.get("/signup")
async def signup(request: AuthRequest):
    response = supabase.auth.sign_up(
        {
            "email": request.email,
            "password": request.password,
        }
    )
    return response

# Resets a users password by sending an email page
# Reminder: Customize this email page at some point.
@router.get("/forgot_password")
async def forgot_password():
    return "forgot password"

# Let a user delete their account.
# Don't actually do that though because we need to keep track of their recordings and other data.
# !Lock their account!
@router.get("/delete_account")
async def delete_account():
    return "deleting account..."