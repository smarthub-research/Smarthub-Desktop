from fastapi import APIRouter
from constants import supabase
from services.message_handler import current_test_id
from .auth import get_user_id
from typing import Optional

router = APIRouter(
    prefix="/db",
    tags=["db"],
    responses={404: {"description": "Not found"}}
)

    

# Adds a test to the database
# Add idempotent ability so duplicate writes don't occur
# only recieves test name and comments from the front end. none of the recorded data
@router.post("/write_test")
async def write_test_info(data: dict):
    user_id = get_user_id()
    test_file_id = current_test_id
    if test_file_id is None:
        return {"error": "No test data available. Please end a test first."}
    test_info_response = (
        supabase.table("test_info")
        .insert({
            "test_file_id": test_file_id,
            "comments": data["comments"],
            "test_name": data["testName"],
            "recorded_by_user_id": user_id,
        })
        .execute()
    )
    return {"test_file_id": test_file_id, "test_info": test_info_response.data[0]}

async def write_test(test_data: dict):
    try:
        test_files_response = (
            supabase.table("test_files")
            .insert({
                "distance": test_data["distance"],
                "timeStamp": test_data["timeStamp"],
                "displacement": test_data["displacement"],
                "velocity": test_data["velocity"],
                "heading": test_data["heading"],
                "trajectory_x": test_data["trajectory_x"],
                "trajectory_y": test_data["trajectory_y"],
                "gyro_left": test_data["gyro_left"],
                "gyro_right": test_data["gyro_right"],
                'gyro_left_smoothed': test_data["gyro_left_smoothed"],
                'gyro_right_smoothed': test_data["gyro_right_smoothed"],
                "accel_right": test_data["accel_right"],
                "accel_left": test_data["accel_left"],
            })
            .execute()
        )
        print("Wrote test: ", test_files_response, flush=True)
        test_file_id = test_files_response.data[0]["id"]
        return test_file_id
    except Exception as e:
        print("Error writing test: ", e, flush=True)
        return None

# Fetches all tests with pagination
@router.get("/tests")
async def get_tests(page: int = 1, limit: int = 25):
    # Calculate offset for pagination
    offset = (page - 1) * limit
    
    # Get paginated results
    response = (
        supabase.table("test_info")
        .select("*, test_files(*)")
        .range(offset, offset + limit - 1)
        .order("created_at", desc=True)
        .execute()
    )
    
    # Get total count (simplified approach)
    total_response = supabase.table("test_info").select("id").execute()
    total_count = len(total_response.data) if total_response.data else 0
    
    # Process the results
    tests = []
    for test in response.data:
        if test.get("test_files"):
            test_files = test["test_files"]
            # Convert arrays to lists for JSON serialization
            for field in ["distance", "timeStamp", "displacement", "velocity", "heading", "trajectory_x", "trajectory_y", "gyro_left", "gyro_right", "gyro_left_smoothed", "gyro_right_smoothed", "accel_right", "accel_left"]:
                if field in test_files and test_files[field]:
                    test_files[field] = list(test_files[field])
        tests.append(test)
    
    total_pages = (total_count + limit - 1) // limit  # Ceiling division
    
    return {
        "tests": tests,
        "pagination": {
            "page": page,
            "limit": limit,
            "total_count": total_count,
            "total_pages": total_pages
        }
    }

# Converts the response from supabase into the format:
#   "displacement" : {"displacement": [], "timeStamp": []},
#   "velocity" : {"velocity": [], "timeStamp": []},
#   "heading" : {"heading": [], "timeStamp": []},
#   "trajectory" : {"trajectory_y": [], "trajectory_x": [], "timeStamp": []}
def format_for_review(response):
    test_data = response.data[0]
    test_files = test_data["test_files"]
    
    # Convert arrays to lists for JSON serialization
    time_stamps = list(test_files["timeStamp"])

    # Format individual data types with timestamps
    def format_data_with_time(data_array, data_type):
        if not data_array: return {}
        data_list = list(data_array)
        return [
            {
                "time": round(float(time) / 1000, 2),
                data_type: data_list[index] if index < len(data_list) else None
            }
            for index, time in enumerate(time_stamps)
        ]

    # Format trajectory data with timestamps
    def format_trajectory_data():
        trajectory_x = list(test_files["trajectory_x"])
        trajectory_y = list(test_files["trajectory_y"])
        return [
            {
                "time": round(float(time) / 1000, 2),
                "trajectory_x": trajectory_x[index] if index < len(trajectory_x) else None,
                "trajectory_y": trajectory_y[index] if index < len(trajectory_y) else None
            }
            for index, time in enumerate(time_stamps)
        ]

    formatted_response = {
        **test_data,
        "distance": format_data_with_time(test_files["distance"], "distance"),
        "displacement": format_data_with_time(test_files["displacement"], "displacement"),
        "velocity": format_data_with_time(test_files["velocity"], "velocity"),
        "heading": format_data_with_time(test_files["heading"], "heading"),
        "trajectory": format_trajectory_data()
    }

    return formatted_response

# Get a single test
@router.get("/tests/{test_id}")
async def get_test(test_id: int, response_format: Optional[str] = None):
    import json
    response = (
        supabase.table("test_info")
        .select("*, test_files(*)")
        .eq("id", test_id)
        .execute()
    )

    if response_format == "review":
        formatted_response = format_for_review(response)
        return formatted_response

    # Parse JSON strings back to arrays for raw response
    if response.data and response.data[0].get("test_files"):
        test_files = response.data[0]["test_files"]
        # Parse all JSON fields back to arrays
        json_fields = ["timeStamp", "distance", "displacement", "velocity", "heading", 
                      "trajectory_x", "trajectory_y", "gyro_left", "gyro_right", 
                      "gyro_left_smoothed", "gyro_right_smoothed", "accel_right", "accel_left"]
        for field in json_fields:
            if field in test_files and test_files[field]:
                test_files[field] = json.loads(test_files[field])

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