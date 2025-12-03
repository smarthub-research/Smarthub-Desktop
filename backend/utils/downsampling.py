"""
Downsampling utilities using Largest Triangle Three Buckets (LTTB) algorithm.
Ported from JavaScript downsamplingUtils.js
"""
from typing import Dict, List, Any
import math


def downsample_data(buffer: Dict[str, List], target_points: int) -> List[Dict[str, Any]]:
    """
    Downsample data using Largest Triangle Three Buckets (LTTB) algorithm.
    Works with a buffer dict that has arrays of values.

    :param buffer: Buffer containing arrays of data values with keys:
                   timeStamp, gyroLeft, gyroRight, accelLeft, accelRight,
                   distance, velocity, heading, trajectory_x, trajectory_y
    :param target_points: Target number of points after downsampling
    :return: List of downsampled data points as dictionaries
    """
    # Validate that buffer has required keys and non-empty arrays
    required_keys = ["timeStamp", "distance", "velocity", "heading", "trajectory_x", "trajectory_y"]
    for key in required_keys:
        if key not in buffer or not buffer[key]:
            # Return empty list if any required data is missing or empty
            return []
    
    # Validate all arrays have the same length
    data_length = len(buffer["timeStamp"])
    for key in required_keys:
        if len(buffer[key]) != data_length:
            # Arrays have mismatched lengths, return empty to avoid errors
            return []
    
    if data_length == 0:
        return []
    
    if data_length <= target_points:
        # Not enough data to downsample, return data as is but in proper format
        result = []
        for i in range(data_length):
            result.append({
                "distance": buffer["distance"][i],
                "velocity": buffer["velocity"][i],
                "heading": buffer["heading"][i],
                "trajectory_x": buffer["trajectory_x"][i],
                "trajectory_y": buffer["trajectory_y"][i],
                "timeStamp": buffer["timeStamp"][i]
            })
        return result

    # When specifically downsampling to 3 points:
    if target_points == 3:
        # First point is always included
        result = [{
            "distance": buffer["distance"][0],
            "velocity": buffer["velocity"][0],
            "heading": buffer["heading"][0],
            "trajectory_x": buffer["trajectory_x"][0],
            "trajectory_y": buffer["trajectory_y"][0],
            "timeStamp": buffer["timeStamp"][0]
        }]

        # Find the point in the middle that creates the largest triangle with first and last points
        first_timestamp = buffer["timeStamp"][0]
        last_timestamp = buffer["timeStamp"][data_length - 1]
        first_distance = buffer["distance"][0]
        last_distance = buffer["distance"][data_length - 1]

        max_area = -1
        max_area_index = 1

        # Check all points between first and last
        for i in range(1, data_length - 1):
            current_timestamp = buffer["timeStamp"][i]
            current_distance = buffer["distance"][i]

            # Calculate triangle area using cross product
            area = abs(
                (first_timestamp - last_timestamp) *
                (current_distance - first_distance) -
                (first_timestamp - current_timestamp) *
                (last_distance - first_distance)
            )

            if area > max_area:
                max_area = area
                max_area_index = i

        # Add the point that creates largest triangle
        result.append({
            "distance": buffer["distance"][max_area_index],
            "velocity": buffer["velocity"][max_area_index],
            "heading": buffer["heading"][max_area_index],
            "trajectory_x": buffer["trajectory_x"][max_area_index],
            "trajectory_y": buffer["trajectory_y"][max_area_index],
            "timeStamp": buffer["timeStamp"][max_area_index]
        })

        # Add the last point
        result.append({
            "distance": buffer["distance"][data_length - 1],
            "velocity": buffer["velocity"][data_length - 1],
            "heading": buffer["heading"][data_length - 1],
            "trajectory_x": buffer["trajectory_x"][data_length - 1],
            "trajectory_y": buffer["trajectory_y"][data_length - 1],
            "timeStamp": buffer["timeStamp"][data_length - 1]
        })

        return result

    # For other target sizes, use the general LTTB algorithm
    sampled = [{
        "distance": buffer["distance"][0],
        "velocity": buffer["velocity"][0],
        "heading": buffer["heading"][0],
        "trajectory_x": buffer["trajectory_x"][0],
        "trajectory_y": buffer["trajectory_y"][0],
        "timeStamp": buffer["timeStamp"][0]
    }]

    bucket_size = data_length / (target_points - 2)

    for i in range(target_points - 2):
        start_idx = math.floor(i * bucket_size) + 1
        end_idx = math.floor((i + 1) * bucket_size) + 1
        last_point = sampled[-1]
        next_bucket_index = min(math.floor((i + 2) * bucket_size) + 1, data_length - 1)

        next_point = {
            "distance": buffer["distance"][next_bucket_index],
            "timeStamp": buffer["timeStamp"][next_bucket_index]
        }

        max_area_index = _get_max_area_index(buffer, start_idx, end_idx, last_point, next_point)

        sampled.append({
            "distance": buffer["distance"][max_area_index],
            "velocity": buffer["velocity"][max_area_index],
            "heading": buffer["heading"][max_area_index],
            "trajectory_x": buffer["trajectory_x"][max_area_index],
            "trajectory_y": buffer["trajectory_y"][max_area_index],
            "timeStamp": buffer["timeStamp"][max_area_index]
        })

    if data_length > 1:
        sampled.append({
            "distance": buffer["distance"][data_length - 1],
            "velocity": buffer["velocity"][data_length - 1],
            "heading": buffer["heading"][data_length - 1],
            "trajectory_x": buffer["trajectory_x"][data_length - 1],
            "trajectory_y": buffer["trajectory_y"][data_length - 1],
            "timeStamp": buffer["timeStamp"][data_length - 1]
        })

    return sampled


def _get_max_area_index(
    buffer: Dict[str, List],
    start_idx: int,
    end_idx: int,
    last_point: Dict[str, Any],
    next_point: Dict[str, Any]
) -> int:
    """
    Find the index of the point that creates the largest triangle area.

    :param buffer: Buffer containing arrays of data values
    :param start_idx: Start index of the bucket
    :param end_idx: End index of the bucket
    :param last_point: Previous selected point
    :param next_point: Next bucket's average point
    :return: Index of the point with maximum area
    """
    max_area = -1
    max_area_index = start_idx

    for j in range(start_idx, end_idx):
        # Calculate triangle area using cross product
        current_timestamp = buffer["timeStamp"][j]
        current_distance = buffer["distance"][j]

        area = abs(
            (last_point["timeStamp"] - next_point["timeStamp"]) *
            (current_distance - last_point["distance"]) -
            (last_point["timeStamp"] - current_timestamp) *
            (next_point["distance"] - last_point["distance"])
        )

        if area > max_area:
            max_area = area
            max_area_index = j

    return max_area_index
