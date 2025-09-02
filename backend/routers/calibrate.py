from fastapi import APIRouter
import copy
from scipy.fftpack import fftfreq, irfft, rfft
from scipy.optimize import fsolve
import numpy as np
from calc import (
    get_top_traj,
    get_velocity_m_s,
    get_heading_deg,
    get_displacement_m
)
from scipy.spatial import cKDTree
from constants import supabase

router = APIRouter(
    prefix="/calibrate",
    tags=["calibrate"],
    responses={404: {"description": "Not found"}}
)

@router.post("/")
async def perform_calibration(data: dict):
    smarthub_id = data["smarthub_id"]
    calibration_name = data["calibration_name"]
    calibration = Calibration(data)

    calibration.perform_calibration()

    return {
        "response": await save_calibration(smarthub_id, data, calibration.left_gain, calibration.right_gain, calibration.wheel_dist, calibration_name),
        "left_gain": calibration.left_gain,
        "right_gain": calibration.right_gain,
        "wheel_distance": calibration.wheel_dist
    }

class Calibration:
    
    def __init__(self, data):
        self.data = {
            'gyro_right': data['gyro_right'],
            'gyro_left': data['gyro_left'],
            'time_from_start': data['time_from_start'],
            'gyro_right_smoothed': [],
            'gyro_left_smoothed': [],
        }

    def perform_calibration(self):

        self.smooth_data()

        self.left_gain, self.right_gain, self.wheel_dist = fsolve(minimize_turnaround, [20,20,20], args=self.data)

    def smooth_data(self):
        data = {'time_from_start': copy.deepcopy(self.data['time_from_start']),
                'gyro_left': copy.deepcopy(self.data['gyro_left']),
                'gyro_right': copy.deepcopy(self.data['gyro_right'])}
        
        # find shortest array
        min_len = min(len(data['gyro_left']), len(data['gyro_right']), len(data['time_from_start']))
        data['gyro_left'] = data['gyro_left'][:min_len]
        data['gyro_right'] = data['gyro_right'][:min_len]
        data['time_from_start'] = data['time_from_start'][:min_len]

        # Filtering with low pass filter
        filter_freq =  6
        # Calculate fourier transform of right gyroscope data to convert to frequency domain
        W_right = fftfreq(len(data['gyro_right']), d=data['time_from_start'][1]-data['time_from_start'][0])
        f_gyro_right = rfft(data['gyro_right'])
        # Filter out right gyroscope signal above 6 Hz
        f_right_filtered = f_gyro_right.copy()
        f_right_filtered[(np.abs(W_right)>filter_freq)] = 0
        # convert filtered signal back to time domain
        gyro_right_smoothed = irfft(f_right_filtered)

        self.data['gyro_right_smoothed'] = list(gyro_right_smoothed)

        # Calculate fourier transform of right gyroscope data to convert to frequency domain
        W_left = fftfreq(len(data['gyro_left']), d=data['time_from_start'][1]-data['time_from_start'][0])
        f_gyro_left = rfft(data['gyro_left'])
        # Filter out right gyroscope signal above 6 Hz
        f_left_filtered = f_gyro_left.copy()
        f_left_filtered[(np.abs(W_left)>filter_freq)] = 0
        # convert filtered signal back to time domain
        gyro_left_smoothed = irfft(f_left_filtered)

        self.data['gyro_left_smoothed'] = list(gyro_left_smoothed)


def minimize_turnaround(params, test):
    ml, mr, W = params


    if 'elapsed_time_s' in test:
        time_from_start = np.array(test['elapsed_time_s'])
    elif 'time_from_start' in test:
        time_from_start = np.array(test['time_from_start'])
    else:
        raise ValueError("No time data found")
    
    min_len = min(len(time_from_start), len(test['gyro_left_smoothed']), len(test['gyro_right_smoothed']))

    time_from_start = time_from_start[:min_len]
    rot_l = np.array(test['gyro_left_smoothed'])[:min_len]
    rot_r = np.array(test['gyro_right_smoothed'])[:min_len]

    disp_m = np.array(get_displacement_m(time_from_start, rot_l*ml, rot_r*mr, dist_wheels=W, diameter=1))
    heading = np.array(get_heading_deg(time_from_start, rot_l*ml, rot_r*mr, dist_wheels=W, diameter=1))
    velocity = np.array(get_velocity_m_s(time_from_start, rot_l*ml, rot_r*mr, dist_wheels=W, diameter=1))
    traj = np.array(get_top_traj(disp_m, velocity, heading, time_from_start, dist_wheels=W, diameter=1))

    # finds the start and end of the turnaround, make it constant between runs
    if not hasattr(minimize_turnaround, "start_turn"):
        heading_diff = [0]
        for i in range(1, len(heading)):
            heading_diff.append(heading[i] - heading[i-1])

        turning_points = np.where(np.abs(np.array(heading_diff)) > 0.1)
        if turning_points:
            minimize_turnaround.start_turn, minimize_turnaround.end_turn = (largest_consecutive_group(turning_points[0])[0], largest_consecutive_group(turning_points[0])[-1])
            # print(time_from_start[minimize_turnaround.start_turn], time_from_start[minimize_turnaround.end_turn])

    start_turn = minimize_turnaround.start_turn
    end_turn = minimize_turnaround.end_turn

    # print(10 - (disp_m[start_turn] + (disp_m[-1] - disp_m[end_turn])))

    # net_distance_error = (10 - (disp_m[start_turn] + (disp_m[-1] - disp_m[end_turn])))
    net_distance_error = (10 - disp_m[-1])

    halfway_point = disp_m[-1] / 2

    # quarter_point = disp_m[-1] / 4
    # three_quarter_point = disp_m[-1] * 3 / 4

    distance_error = 5 - halfway_point

    first_half = traj[:start_turn]
    second_half = traj[end_turn:]

    straight_line_start = np.linspace(np.array([0,0]), np.array(first_half[-1]), 3000)
    straight_line_end = np.linspace(np.array(second_half[0]), np.array([0,0]), 3000)

    turn_loss = (compute_net_loss(first_half, straight_line_start) + compute_net_loss(second_half, straight_line_end)) / 2

    # Compute the net loss between the two halves
    net_loss = compute_net_loss(first_half, second_half)

    # print()
    # print(net_loss, distance_error, turn_loss)
    # print(net_loss, net_distance_error, turn_loss)

    # return net_loss, distance_error, heading_diff
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


async def save_calibration(smarthub_id, data, wheel_dist, left_gain, right_gain, calibration_name):
    # save dictionary to json
    response = (
        supabase.table("calibrations")
        .insert({
            'smarthub_id': smarthub_id,
            'calibration_name': calibration_name,
            'wheel_distance': wheel_dist,
            'left_gain': left_gain,
            'right_gain': right_gain,
            'raw_data': data
        })
        .execute()
    )
    return response
