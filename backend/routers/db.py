from fastapi import APIRouter, HTTPException
from constants import supabase
from .auth import get_user_id
from typing import Optional
import services.message_handler as message_handler_module
from services.message_processor import DataProcessor
from services.data_length_validator import DataLengthValidator
from utils.filtering import FFTLowPassFilter

import constants

router = APIRouter(
    prefix="/db",
    tags=["db"],
    responses={404: {"description": "Not found"}}
)


@router.get("/check_test_file_id")
async def check_test_file_id():
    """Return the currently buffered test file id (if a test is in progress).

    The `message_handler_module` maintains a transient `current_test_id` set
    when an incoming test recording is finalized. This endpoint is used by
    clients to check whether a test payload is available to be written.
    """
    test_id = message_handler_module.current_test_id
    print(f"check_test_file_id called, current_test_id: {test_id}", flush=True)
    return {"test_file_id": test_id}


@router.post("/write_test")
async def write_test_info(data: dict):
    """Persist test metadata (name, comments) and associate it with the
    most recently recorded test file id.
    """
    try:
        print(f"write_test_info called with data: {data}", flush=True)
        user_id = await get_user_id()
        print(f"User ID: {user_id}", flush=True)

        test_file_id = message_handler_module.current_test_id
        print(f"Current test file ID: {test_file_id}", flush=True)

        if test_file_id is None:
            print("ERROR: No test file ID available", flush=True)
            raise HTTPException(status_code=400, detail="No test data available. Please end a test first.")

        test_info_response = (
            supabase.table("test_info")
            .insert({
                "test_file_id": test_file_id,
                "comments": data.get("comments", ""),
                "test_name": data.get("testName", ""),
                "recorded_by_user_id": user_id,
            })
            .execute()
        )
        print(f"Supabase response: {test_info_response}", flush=True)

        if not test_info_response.data:
            raise Exception("No data returned from Supabase insert")

        return {"test_file_id": test_file_id, "test_info": test_info_response.data[0]}
    except Exception as e:
        print(f"Error writing test info: {e}", flush=True)
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


async def write_test(test_data: dict):
    """Insert the raw test_files payload into Supabase and return the new id.

    This helper is intended to be called by the message processing pipeline
    after a recording is finalized.
    """
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
        test_file_id = test_files_response.data[0]["id"]
        return test_file_id
    except Exception as e:
        print("Error writing test: ", e, flush=True)
        return None


@router.get("/tests")
async def get_tests(page: int = 1, limit: int = 25):
    """Return paginated `test_info` rows for the dashboard.

    This endpoint returns a simple pagination object with `tests` and
    `pagination` metadata to simplify client-side rendering.
    """
    offset = (page - 1) * limit

    response = (
        supabase.table("test_info")
        .select("*")
        .range(offset, offset + limit - 1)
        .order("created_at", desc=True)
        .execute()
    )

    total_response = supabase.table("test_info").select("id").execute()
    total_count = len(total_response.data) if total_response.data else 0

    total_pages = (total_count + limit - 1) // limit

    return {
        "tests": response.data,
        "pagination": {
            "page": page,
            "limit": limit,
            "total_count": total_count,
            "total_pages": total_pages
        }
    }


def format_for_review(response, full_data=False):
    """Convert the Supabase `test_info -> test_files` response into a
    frontend-friendly format suitable for the review UI.

    The function down-samples long time-series for efficient client
    rendering unless `full_data=True` is provided.
    """
    test_data = response.data[0]
    test_files = test_data["test_files"]

    time_stamps = list(test_files["timeStamp"])

    MAX_POINTS = 2000
    downsample_factor = 1 if full_data else max(1, len(time_stamps) // MAX_POINTS)

    def format_data_with_time(data_array, data_type):
        if not data_array: return []
        data_list = list(data_array)
        return [
            {
                "time": time_stamps[index],
                data_type: data_list[index] if index < len(data_list) else None
            }
            for index in range(0, len(time_stamps), downsample_factor)
        ]

    def format_trajectory_data():
        trajectory_x = list(test_files["trajectory_x"])
        trajectory_y = list(test_files["trajectory_y"])
        return [
            {
                "time": round(float(time_stamps[index]) / 1000, 2),
                "trajectory_x": trajectory_x[index] if index < len(trajectory_x) else None,
                "trajectory_y": trajectory_y[index] if index < len(trajectory_y) else None
            }
            for index in range(0, len(time_stamps), downsample_factor)
        ]

    formatted_response = {
        **test_data,
        "distance": format_data_with_time(test_files["distance"], "distance"),
        "displacement": format_data_with_time(test_files["displacement"], "displacement"),
        "velocity": format_data_with_time(test_files["velocity"], "velocity"),
        "heading": format_data_with_time(test_files["heading"], "heading"),
        "trajectory": format_trajectory_data(),
        "data_info": {
            "is_downsampled": not full_data and downsample_factor > 1,
            "original_length": len(time_stamps),
            "returned_length": len(time_stamps) // downsample_factor,
            "downsample_factor": downsample_factor
        }
    }

    return formatted_response


@router.get("/tests/{test_id}")
async def get_test(test_id: int, response_format: Optional[str] = None, full_data: bool = False):
    """Retrieve a single test by id. Supports `response_format=review` to
    return the formatted payload expected by the review UI.
    """
    import json
    response = (
        supabase.table("test_info")
        .select("*, test_files(*)")
        .eq("id", test_id)
        .execute()
    )

    if response_format == "review":
        formatted_response = format_for_review(response, full_data)
        return formatted_response

    # If raw response requested, parse stored JSON strings into arrays
    if response.data and response.data[0].get("test_files"):
        test_files = response.data[0]["test_files"]
        json_fields = ["timeStamp", "distance", "displacement", "velocity", "heading", 
                      "trajectory_x", "trajectory_y", "gyro_left", "gyro_right", 
                      "gyro_left_smoothed", "gyro_right_smoothed", "accel_right", "accel_left"]
        for field in json_fields:
            if field in test_files and test_files[field]:
                test_files[field] = json.loads(test_files[field])

    return response


@router.put("/update_test/{test_id}")
async def update_test(test_id: int, new_data: dict):
    """Update test metadata (e.g. name, comments) for a given test id."""
    response = (
        supabase.table("test_info")
        .update(new_data)
        .eq("id", test_id)
        .execute()
    )
    return response


@router.post("/recalculate/{test_id}")
async def recalculate_test(test_id: int):
    """Recalculate derived test values (distance, heading, etc.) from raw gyro data.

    The endpoint reprocesses the stored raw gyro/timestamp arrays using the
    current calibration constants and creates a new `test_files` + `test_info`
    pair containing the recalculated series. The new test info is returned in
    the same review format as other endpoints.
    """
    try:
        import json
        response = (
            supabase.table("test_info")
            .select("*, test_files(*)")
            .eq("id", test_id)
            .execute()
        )

        if not response.data or len(response.data) == 0:
            raise HTTPException(status_code=404, detail="Test not found")

        test_data = response.data[0]
        test_files = test_data["test_files"]

        # Parse the stored gyro data and timestamps
        time_stamps = json.loads(test_files["timeStamp"]) if isinstance(test_files["timeStamp"], str) else test_files["timeStamp"]
        gyro_left = json.loads(test_files["gyro_left"]) if isinstance(test_files["gyro_left"], str) else test_files["gyro_left"]
        gyro_right = json.loads(test_files["gyro_right"]) if isinstance(test_files["gyro_right"], str) else test_files["gyro_right"]

        raw_data = {
            'time_from_start': time_stamps,
            'gyro_left': gyro_left,
            'gyro_right': gyro_right
        }

        # Build processor pipeline and validate lengths
        validator = DataLengthValidator()
        signal_filter = FFTLowPassFilter(cutoff_freq=5.0)
        processor = DataProcessor(validator, signal_filter)

        processed_result = processor.process_data(
            raw_data,
            constants.left_gain,
            constants.right_gain,
            constants.WHEEL_DIAM_IN,
            constants.DIST_WHEELS_IN
        )

        if not processed_result:
            raise HTTPException(status_code=500, detail="Failed to process data")

        import numpy as np

        def to_list(data):
            """Convert numpy arrays or other array-like objects to lists"""
            if isinstance(data, np.ndarray):
                return data.tolist()
            elif isinstance(data, list):
                return data
            else:
                return list(data) if hasattr(data, '__iter__') and not isinstance(data, str) else data

        new_test_data = {
            "distance": to_list(processed_result['dist_m']),
            "displacement": to_list(processed_result['disp_m']),
            "velocity": to_list(processed_result['velocity']),
            "heading": to_list(processed_result['heading_deg']),
            "trajectory_x": to_list(processed_result['trajectory']['x']),
            "trajectory_y": to_list(processed_result['trajectory']['y']),
            "timeStamp": time_stamps,
            "gyro_left": gyro_left,
            "gyro_right": gyro_right,
            "gyro_left_smoothed": to_list(processed_result['gyro_left_smoothed']),
            "gyro_right_smoothed": to_list(processed_result['gyro_right_smoothed']),
            "accel_left": json.loads(test_files["accel_left"]) if test_files.get("accel_left") and isinstance(test_files["accel_left"], str) else test_files.get("accel_left"),
            "accel_right": json.loads(test_files["accel_right"]) if test_files.get("accel_right") and isinstance(test_files["accel_right"], str) else test_files.get("accel_right"),
        }

        new_test_files_response = (
            supabase.table("test_files")
            .insert(new_test_data)
            .execute()
        )

        new_test_file_id = new_test_files_response.data[0]["id"]

        user_id = await get_user_id()

        new_test_info = {
            "test_file_id": new_test_file_id,
            "test_name": f"{test_data['test_name']} (Recalculated)",
            "comments": f"Recalculated from test ID {test_id}. {test_data.get('comments', '')}",
            "recorded_by_user_id": user_id,
        }

        new_test_info_response = (
            supabase.table("test_info")
            .insert(new_test_info)
            .execute()
        )

        new_test_id = new_test_info_response.data[0]["id"]

        new_test_response = (
            supabase.table("test_info")
            .select("*, test_files(*)")
            .eq("id", new_test_id)
            .execute()
        )

        formatted_response = format_for_review(new_test_response, full_data=False)
        formatted_response["new_test_id"] = new_test_id
        return formatted_response

    except Exception as e:
        print(f"Error recalculating test: {e}", flush=True)
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))