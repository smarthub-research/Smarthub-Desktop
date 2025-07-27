from fastapi import APIRouter
from constants import supabase

router = APIRouter(
    prefix="/db",
    tags=["db"],
    responses={404: {"description": "Not found"}}
)

# Adds a test to the database
# Add idempotent ability so duplicate writes don't occur
@router.put("/write_test")
async def write_test():
    response = (
        supabase.table("planets")
        .insert({"id": 1, "name": "Pluto"})
        .execute()
    )
    return response

# Fetches all tests
@router.get("/tests")
async def get_tests():
    response = (
        supabase.table("test_info")
        .select("*, test_files(*)")
        .execute()
    )
    return response

# Get a single test
@router.get("/tests/{test_id}")
async def get_test(test_id: int):
    response = (
        supabase.table("test_info")
        .select("*, test_files(*)")
        .eq("id", test_id)
        .execute()
    )
    return response