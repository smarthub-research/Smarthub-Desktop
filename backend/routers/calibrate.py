"""
Calibration endpoints and utilities

Provides an endpoint to perform calibration and helpers used to compute
optimal wheel gains and wheel distance. The core numeric routines rely on
SciPy/Numpy and local utilities in `utils.calc` and `utils.filtering`.
"""

from fastapi import APIRouter
from scipy.optimize import fsolve
import numpy as np
from utils.calc import CalcUtils
from utils.filtering import smooth_data

from scipy.spatial import cKDTree
from constants import supabase

router = APIRouter(
    prefix="/calibrate",
    tags=["calibrate"],
    responses={404: {"description": "Not found"}}
)


# JSON payload expected for POST /calibrate/
# {
#    "smarthubId": string,
#    "calibrationName" : string,
# }
@router.post("/")
async def perform_calibration(data: dict):
    """Entry point for performing a calibration.

    Note: The current `Calibration` class expects its `data` attribute to be
    populated with the test payload before calling `perform_calibration`.
    """
    smarthubId = data["smarthubId"]
    calibrationName = data["calibrationName"]
    calibration = Calibration()
    # calibration.data should be set by caller or before calling perform_calibration
    calibration.perform_calibration()
    response = await save_calibration(smarthubId, calibration.data, calibration.wheel_dist, calibration.leftGain, calibration.rightGain, calibrationName)
    return response.data


@router.get("/all")
async def get_all_calibrations():
    """Return all saved calibrations from the database."""
    response = (
        supabase.table("calibrations")
        .select("*")
        .execute()
    )
    return response.data


class Calibration:
    """Holds calibration state and performs optimization.

    The class stores calculated gains and wheel distance after running
    `perform_calibration`.
    """
    def __init__(self) -> None:
        self.data = None
        self.calc_utils = CalcUtils()
        self.leftGain = None
        self.rightGain = None
        self.wheel_dist = None

    def perform_calibration(self):
        # The calibration requires raw test data to be available in self.data
        if self.data is None:
            raise ValueError("Calibration data must be set before performing calibration.")
        response = smooth_data(self.data)
        self.data["gyroRightSmoothed"] = response["gyro_right_smoothed"]
        self.data["gyroLeftSmoothed"] = response["gyro_left_smoothed"]

        # Use fsolve to optimize leftGain, rightGain, and wheel distance
        optimized_params = fsolve(
            lambda params: minimize_turnaround(params, self.data, self.calc_utils),
            [20, 20, 20]
        )
        self.leftGain, self.rightGain, self.wheel_dist = optimized_params[:3]


def minimize_turnaround(params, test, calc_utils):
    """Objective function used by the optimizer.

    Computes trajectory and various loss terms to produce a single scalar
    error which is minimized by fsolve.
    """
    ml, mr, W = params
    timeStamps = np.array(test['timeStamps'])

    # Ensure arrays are aligned
    min_len = min(len(timeStamps), len(test['gyroLeftSmoothed']), len(test['gyroRightSmoothed']))
    timeStamps = timeStamps[:min_len]
    gyroLeft = np.array(test['gyroLeftSmoothed'])[:min_len]
    gyroRight = np.array(test['gyroRightSmoothed'])[:min_len]

    disp_m = np.array(calc_utils.get_displacement_m(timeStamps, gyroLeft*ml, gyroRight*mr))
    heading = np.array(calc_utils.get_heading_deg(timeStamps, gyroLeft*ml, gyroRight*mr, dist_wheels=W))
    velocity = np.array(calc_utils.get_velocity_m_s(timeStamps, gyroLeft*ml, gyroRight*mr))
    traj_dict = calc_utils.get_top_traj(disp_m, velocity, heading, timeStamps)
    traj = np.column_stack((traj_dict['x'], traj_dict['y']))

    # Detect turnaround region by looking at abrupt heading changes
    heading_diff = np.diff(heading)
    turning_points = np.where(np.abs(heading_diff) > 0.1)[0]
    if turning_points.size > 0:
        groups = largest_consecutive_group(turning_points)
        start_turn = groups[0] if groups else max(1, len(traj) // 4)
        end_turn = groups[-1] if groups else min(len(traj) - 2, 3 * len(traj) // 4)
    else:
        n = len(traj)
        start_turn = max(1, n // 4)
        end_turn = min(n - 2, 3 * n // 4)

    net_distance_error = (10 - disp_m[-1])

    first_half = traj[:start_turn]
    second_half = traj[end_turn:]

    straight_line_start = np.linspace(np.array([0,0]), np.array(first_half[-1]), 3000)
    straight_line_end = np.linspace(np.array(second_half[0]), np.array([0,0]), 3000)

    turn_loss = (compute_net_loss(first_half, straight_line_start) + compute_net_loss(second_half, straight_line_end)) / 2
    net_loss = compute_net_loss(first_half, second_half)

    return net_loss + net_distance_error + turn_loss


def largest_consecutive_group(nums, min_size=60, threshold=0.5):
    """Return flattened groups of consecutive indices that meet heuristics.

    This function looks for long runs of consecutive indices (used to detect
    sustained turning behavior). The thresholds are heuristics and can be
    tuned for different datasets.
    """
    if nums is None or len(nums) == 0:
        return []

    nums = list(nums)
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
    """Compute RMS distance from each point in points1 to its nearest point in points2.

    Uses a KD-tree for efficient nearest-neighbor queries.
    """
    points1 = np.array(points1)
    points2 = np.array(points2)

    tree = cKDTree(points2)
    distances, _ = tree.query(points1)
    rms_distance = np.sqrt(np.mean(distances ** 2))
    return rms_distance


async def save_calibration(smarthubId, data, wheel_dist, leftGain, rightGain, calibrationName):
    """Persist the computed calibration to the database (Supabase).

    The raw test data is stored alongside the calibration metadata to allow
    later inspection or reprocessing.
    """
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
