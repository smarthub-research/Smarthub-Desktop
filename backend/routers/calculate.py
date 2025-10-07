from fastapi import APIRouter
from calc import get_displacement_m, get_velocity_m_s, get_heading_deg, get_top_traj
from .calibrate import smooth_packet
from scipy.fftpack import fftfreq, irfft, rfft
import numpy as np
import copy
import json

def convert_to_native_types(obj):
    """Convert numpy types to native Python types for JSON serialization"""
    if isinstance(obj, np.integer):
        return int(obj)
    elif isinstance(obj, np.floating):
        return float(obj)
    elif isinstance(obj, np.ndarray):
        return obj.tolist()
    elif isinstance(obj, list):
        return [convert_to_native_types(item) for item in obj]
    elif isinstance(obj, dict):
        return {key: convert_to_native_types(value) for key, value in obj.items()}
    else:
        return obj

router = APIRouter(
    prefix="/calculate",
    tags=["calculate"],
    responses={404: {"description": "Not found"}}
)

def smooth(data):
    result = {}
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

    result['gyro_right_smoothed'] = gyro_right_smoothed

    # Calculate fourier transform of right gyroscope data to convert to frequency domain
    W_left = fftfreq(len(data['gyro_left']), d=data['time_from_start'][1]-data['time_from_start'][0])
    f_gyro_left = rfft(data['gyro_left'])
    # Filter out right gyroscope signal above 6 Hz
    f_left_filtered = f_gyro_left.copy()
    f_left_filtered[(np.abs(W_left)>filter_freq)] = 0
    # convert filtered signal back to time domain
    gyro_left_smoothed = irfft(f_left_filtered)

    result['gyro_left_smoothed'] = gyro_left_smoothed
    return result

# Expected input 
@router.post("/")
async def calc(data: dict):
    
    right_gain = 1.12
    left_gain = 1.13

    # Apply gain to each element in the smoothed arrays
    data["gyro_right"] = [x * right_gain for x in data["gyro_right"]]
    data["gyro_left"] = [x * left_gain for x in data["gyro_left"]]

    # Default wheel_distance if not present
    wheel_distance = 26

    displacement = get_displacement_m(data["time_from_start"], data["gyro_left"], data["gyro_right"], 24, wheel_distance)
    velocity = get_velocity_m_s(data["time_from_start"], data["gyro_left"], data["gyro_right"], 24, wheel_distance)
    heading = get_heading_deg(data["time_from_start"], data["gyro_left"], data["gyro_right"], 24, wheel_distance)
    trajectory = get_top_traj(disp_m=displacement, vel_ms=velocity, heading_deg=heading, time_from_start=data["time_from_start"])

    # Transform trajectory data to separate x,y arrays to match frontend expectations
    trajectory_x = [point[0] for point in trajectory] if trajectory else []
    trajectory_y = [point[1] for point in trajectory] if trajectory else []

    return {
        "displacement": displacement,
        "velocity": velocity,
        "heading": heading,
        "trajectory_x": trajectory_x,
        "trajectory_y": trajectory_y,
        "gyro_left": data["gyro_left"],
        "gyro_right": data["gyro_right"],
        "timeStamp": data["time_from_start"]
    }

@router.post("/1")
async def calc2(data: dict):
    # set value of time and gyros so we don't get a race condition, other data is being updated in real time
    time_from_start = copy.deepcopy(data['time_from_start'])
    gyro_left = copy.deepcopy(data['gyro_left'])
    gyro_right = copy.deepcopy(data['gyro_right'])

    try:
        # Filtering with low pass filter
        filter_freq = 6
        # Calculate fourier transform of right gyroscope data to convert to frequency domain
        W_right = fftfreq(len(gyro_right), d=time_from_start[1]-time_from_start[0])
        f_gyro_right = rfft(gyro_right)
        # Filter out right gyroscope signal above 6 Hz
        f_right_filtered = f_gyro_right.copy()
        f_right_filtered[(np.abs(W_right)>filter_freq)] = 0
        # convert filtered signal back to time domain
        gyro_right_smoothed = irfft(f_right_filtered)

        # Calculate fourier transform of left gyroscope data to convert to frequency domain
        W_left = fftfreq(len(gyro_left), d=time_from_start[1]-time_from_start[0])
        f_gyro_left = rfft(gyro_left)
        # Filter out left gyroscope signal above 6 Hz
        f_left_filtered = f_gyro_left.copy()
        f_left_filtered[(np.abs(W_left)>filter_freq)] = 0
        # convert filtered signal back to time domain
        gyro_left_smoothed = irfft(f_left_filtered)
    except Exception as e:
        print(f"Smoothing error: {e}")
        # Fallback to unsmoothed data

    left_gain = 1.13
    right_gain = 1.12

    WHEEL_DIAM_IN = 24
    DIST_WHEELS_IN = 26

    gyro_left_smoothed = []
    gyro_right_smoothed = []
    # Apply gains
    for i in range(len(gyro_left)):
        gyro_left_smoothed.append(gyro_left[i] * left_gain)
        gyro_right_smoothed.append(gyro_right[i] * right_gain)

    # Calculate displacement, heading, velocity, and trajectory
    displacement = get_displacement_m(time_from_start, gyro_left_smoothed,
                                     gyro_right_smoothed, diameter=WHEEL_DIAM_IN, dist_wheels=DIST_WHEELS_IN)
    print(displacement)
    heading = get_heading_deg(time_from_start, gyro_left_smoothed,
                             gyro_right_smoothed, diameter=WHEEL_DIAM_IN, dist_wheels=DIST_WHEELS_IN)
    velocity = get_velocity_m_s(time_from_start, gyro_left_smoothed,
                               gyro_right_smoothed, diameter=WHEEL_DIAM_IN, dist_wheels=DIST_WHEELS_IN)
    trajectory = get_top_traj(displacement, velocity, heading,
                             time_from_start, diameter=WHEEL_DIAM_IN, dist_wheels=DIST_WHEELS_IN)
    
    # Transform trajectory data to separate x,y arrays to match frontend expectations
    # Convert numpy types to native Python types for JSON serialization
    trajectory_x = [convert_to_native_types(point[0]) for point in trajectory] if trajectory else []
    trajectory_y = [convert_to_native_types(point[1]) for point in trajectory] if trajectory else []
    
    result = {
        "displacement": convert_to_native_types(displacement),
        "velocity": convert_to_native_types(velocity),
        "heading": convert_to_native_types(heading),
        "trajectory_x": trajectory_x,
        "trajectory_y": trajectory_y,
        "gyro_left": convert_to_native_types(gyro_left),
        "gyro_right": convert_to_native_types(gyro_right),
        "timeStamp": convert_to_native_types(time_from_start)
    }
    
    return result


