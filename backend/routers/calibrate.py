from fastapi import APIRouter
from scipy.optimize import fsolve
import numpy as np
from calc import (
    get_top_traj,
    get_velocity_m_s,
    get_heading_deg,
    get_displacement_m,
    smooth_data
)
from scipy.spatial import cKDTree
from constants import supabase

router = APIRouter(
    prefix="/calibrate",
    tags=["calibrate"],
    responses={404: {"description": "Not found"}}
)

# JSON payload expected:
# {
#	"smarthubId": string,
#	"calibrationName" : string,
#	"gyroRight": [integers],
#   "gyroLeft": [integers],
#   "timeStamps": [integers]
# }
@router.post("/")
async def perform_calibration(data: dict):
    smarthubId = data["smarthubId"]
    calibrationName = data["calibrationName"]
    calibration = Calibration(data)

    calibration.perform_calibration()
    response = await save_calibration(smarthubId, calibration.data, calibration.wheel_dist, calibration.leftGain, calibration.rightGain, calibrationName)

    return response.data


# Get all calibrations in the db
@router.get("/all")
async def get_all_calibrations():
    response = (
        supabase.table("calibrations")
        .select("*")
        .execute()
    )
    return response.data

# Class that stores all methods needed for calibration
class Calibration:
    def __init__(self, data):
        self.data = {
            'gyroRight': data['gyroRight'],
            'gyroLeft': data['gyroLeft'],
            'timeStamps': data['timeStamps'],
            'gyroRightSmoothed': [],
            'gyroLeftSmoothed': [],
        }

    def perform_calibration(self):
        response = smooth_data(self.data)
        self.data["gyroRightSmoothed"] = response["gyro_right_smoothed"]
        self.data["gyroLeftSmoothed"] = response["gyro_left_smoothed"]

        self.leftGain, self.rightGain, self.wheel_dist = fsolve(minimize_turnaround, [20,20,20], args=self.data)

def minimize_turnaround(params, test):
    ml, mr, W = params
    timeStamps = np.array(test['timeStamps'])
    
    min_len = min(len(timeStamps), len(test['gyroLeftSmoothed']), len(test['gyroRightSmoothed']))

    timeStamps = timeStamps[:min_len]
    gyroLeft = np.array(test['gyroLeftSmoothed'])[:min_len]
    gyroRight = np.array(test['gyroRightSmoothed'])[:min_len]

    disp_m = np.array(get_displacement_m(timeStamps, gyroLeft*ml, gyroRight*mr, dist_wheels=W, diameter=1))
    heading = np.array(get_heading_deg(timeStamps, gyroLeft*ml, gyroRight*mr, dist_wheels=W, diameter=1))
    velocity = np.array(get_velocity_m_s(timeStamps, gyroLeft*ml, gyroRight*mr, dist_wheels=W, diameter=1))
    traj = np.array(get_top_traj(disp_m, velocity, heading, timeStamps, dist_wheels=W, diameter=1))

    # finds the start and end of the turnaround, make it constant between runs
    if not hasattr(minimize_turnaround, "start_turn"):
        heading_diff = [0]
        for i in range(1, len(heading)):
            heading_diff.append(heading[i] - heading[i-1])

        turning_points = np.where(np.abs(np.array(heading_diff)) > 0.1)
        if turning_points:
            minimize_turnaround.start_turn, minimize_turnaround.end_turn = (largest_consecutive_group(turning_points[0])[0], largest_consecutive_group(turning_points[0])[-1])

    start_turn = minimize_turnaround.start_turn
    end_turn = minimize_turnaround.end_turn

    net_distance_error = (10 - disp_m[-1])

    first_half = traj[:start_turn]
    second_half = traj[end_turn:]

    straight_line_start = np.linspace(np.array([0,0]), np.array(first_half[-1]), 3000)
    straight_line_end = np.linspace(np.array(second_half[0]), np.array([0,0]), 3000)

    turn_loss = (compute_net_loss(first_half, straight_line_start) + compute_net_loss(second_half, straight_line_end)) / 2

    # Compute the net loss between the two halves
    net_loss = compute_net_loss(first_half, second_half)

    return net_loss, net_distance_error, turn_loss


def largest_consecutive_group(nums, min_size=60, threshold=0.5):
    groups, current = [], [nums[0]]

    for i in range(1, len(nums)):
        if nums[i] == nums[i - 1] + 1:
            current.append(nums[i])
        else:
            if len(current) > min_size and any(x > threshold for x in current):
                groups.extend(current)
            current = [nums[i]]

    if len(current) > min_size and any(x > threshold for x in current):
        groups.extend(current)

    return groups


def compute_net_loss(points1, points2):
    """
    Computes the net loss as the sum of the distances between each point in points1
    and its closest point in points2.
    
    :param points1: List of (x, y) tuples representing the first set of points.
    :param points2: List of (x, y) tuples representing the second set of points.
    :return: Net loss (sum of closest point distances).
    """
    # Convert lists to numpy arrays for efficient computation
    points1 = np.array(points1)
    points2 = np.array(points2)

    # Build KDTree for efficient nearest-neighbor search
    tree = cKDTree(points2)

    # Find nearest neighbor distances for all points in points1
    distances, _ = tree.query(points1)

    rms_distance = np.sqrt(np.mean(distances ** 2))

    return rms_distance


# Writes to the database the calculated calibration
async def save_calibration(smarthubId, data, wheel_dist, leftGain, rightGain, calibrationName):
    # save dictionary to json
    response = (
        supabase.table("calibrations")
        .insert({
            'smarthub_id': smarthubId,
            'calibration_name': calibrationName,
            'wheel_distance': wheel_dist,
            'left_gain': leftGain,
            'right_gain': rightGain,
            'raw_data': data
        })
        .execute()
    )
    return response
