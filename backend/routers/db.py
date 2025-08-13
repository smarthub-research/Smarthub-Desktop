from fastapi import APIRouter
from constants import supabase

router = APIRouter(
    prefix="/db",
    tags=["db"],
    responses={404: {"description": "Not found"}}
)

# Adds a test to the database
# Add idempotent ability so duplicate writes don't occur
@router.post("/write_test")
async def write_test(data: dict):
    user = supabase.auth.get_user()
    user_id = user.user.id
    test_files_response = (
        supabase.table("test_files")
        .insert({
            "distance": data["distance"],
            "timeStamp": data["testData"]["timeStamp"],
            "displacement": data["testData"]["displacement"],
            "velocity": data["testData"]["velocity"],
            "heading": data["testData"]["heading"],
            "trajectory_x": data["testData"]["trajectory_x"],
            "trajectory_y": data["testData"]["trajectory_y"],
            "gyro_left": data["testData"]["gyro_left"],
            "gyro_right": data["testData"]["gyro_right"],
            "accel_right": data["testData"]["accel_right"],
            "accel_left": data["testData"]["accel_left"],
        })
        .execute()
    )
    test_file_id = test_files_response.data[0]["id"]
    test_info_response = (
        supabase.table("test_info")
        .insert({
            "test_file_id": test_file_id,
            "comments": data["comments"],
            "test_name": data["testName"],
            "flags": data["flags"],
            "recorded_by_user_id": user_id,
        })
        .execute()
    )
    return {"test_file_id": test_file_id, "test_info": test_info_response.data[0]}

# Fetches all tests
@router.get("/tests")
async def get_tests():
    response = (
        supabase.table("test_info")
        .select("*, test_files(*)")
        .execute()
    )
    return response

def format_for_review(response):
    formatted_response = {}



    return formatted_response

# Get a single test
@router.get("/tests/{test_id}")
async def get_test(test_id: int, format: str = None):
    response = (
        supabase.table("test_info")
        .select("*, test_files(*)")
        .eq("id", test_id)
        .execute()
    )

    if format == "review":
        formatted_response = format_for_review(response)
        return formatted_response

    return response

# Get all announcements
@router.get("/announcements")
async def get_announcements():
    response = (
        supabase.table("announcements")
        .select("*")
        .execute()
    )
    return response

# Changes the test at the given id based on the new test data
# EX. in testName.js the user can change the test name
@router.put("/update_test/{test_id}")
async def update_test(test_id: int, new_data: dict):
    response = (
        supabase.table("test_info")
        .update(new_data)
        .eq("id", test_id)
        .execute()
    )
    return response