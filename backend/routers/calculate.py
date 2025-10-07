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
    W_right = fftfreq(len(data['gyroRight']), d=data['timeStamps'][1]-data['timeStamps'][0])
    f_gyroRight = rfft(data['gyroRight'])
    # Filter out right gyroscope signal above 6 Hz
    f_right_filtered = f_gyroRight.copy()
    f_right_filtered[(np.abs(W_right)>filter_freq)] = 0
    # convert filtered signal back to time domain
    gyroRight_smoothed = irfft(f_right_filtered)

    result['gyroRight_smoothed'] = gyroRight_smoothed

    # Calculate fourier transform of right gyroscope data to convert to frequency domain
    W_left = fftfreq(len(data['gyroLeft']), d=data['timeStamps'][1]-data['timeStamps'][0])
    f_gyroLeft = rfft(data['gyroLeft'])
    # Filter out right gyroscope signal above 6 Hz
    f_left_filtered = f_gyroLeft.copy()
    f_left_filtered[(np.abs(W_left)>filter_freq)] = 0
    # convert filtered signal back to time domain
    gyroLeft_smoothed = irfft(f_left_filtered)

    result['gyroLeft_smoothed'] = gyroLeft_smoothed
    return result

# Expected input 
@router.post("/")
async def calc(data: dict):
    
    rightGain = 1.12
    leftGain = 1.13

    # Apply gain to each element in the smoothed arrays
    data["gyroRight"] = [x * rightGain for x in data["gyroRight"]]
    data["gyroLeft"] = [x * leftGain for x in data["gyroLeft"]]

    # Default wheel_distance if not present
    wheel_distance = 26

    displacement = get_displacement_m(data["timeStamps"], data["gyroLeft"], data["gyroRight"], 24, wheel_distance)
    velocity = get_velocity_m_s(data["timeStamps"], data["gyroLeft"], data["gyroRight"], 24, wheel_distance)
    heading = get_heading_deg(data["timeStamps"], data["gyroLeft"], data["gyroRight"], 24, wheel_distance)
    trajectory = get_top_traj(disp_m=displacement, vel_ms=velocity, heading_deg=heading, timeStamps=data["timeStamps"])

    # Transform trajectory data to separate x,y arrays to match frontend expectations
    trajectory_x = [point[0] for point in trajectory] if trajectory else []
    trajectory_y = [point[1] for point in trajectory] if trajectory else []

    return {
        "displacement": displacement,
        "velocity": velocity,
        "heading": heading,
        "trajectory_x": trajectory_x,
        "trajectory_y": trajectory_y,
        "gyroLeft": data["gyroLeft"],
        "gyroRight": data["gyroRight"],
        "timeStamp": data["timeStamps"]
    }

@router.post("/1")
async def calc2(data: dict):
    # set value of time and gyros so we don't get a race condition, other data is being updated in real time
    timeStamps = copy.deepcopy(data['timeStamps'])
    gyroLeft = copy.deepcopy(data['gyroLeft'])
    gyroRight = copy.deepcopy(data['gyroRight'])

    try:
        # Filtering with low pass filter
        filter_freq = 6
        # Calculate fourier transform of right gyroscope data to convert to frequency domain
        W_right = fftfreq(len(gyroRight), d=timeStamps[1]-timeStamps[0])
        f_gyroRight = rfft(gyroRight)
        # Filter out right gyroscope signal above 6 Hz
        f_right_filtered = f_gyroRight.copy()
        f_right_filtered[(np.abs(W_right)>filter_freq)] = 0
        # convert filtered signal back to time domain
        gyroRight_smoothed = irfft(f_right_filtered)

        # Calculate fourier transform of left gyroscope data to convert to frequency domain
        W_left = fftfreq(len(gyroLeft), d=timeStamps[1]-timeStamps[0])
        f_gyroLeft = rfft(gyroLeft)
        # Filter out left gyroscope signal above 6 Hz
        f_left_filtered = f_gyroLeft.copy()
        f_left_filtered[(np.abs(W_left)>filter_freq)] = 0
        # convert filtered signal back to time domain
        gyroLeft_smoothed = irfft(f_left_filtered)
    except Exception as e:
        print(f"Smoothing error: {e}")
        # Fallback to unsmoothed data

    leftGain = 1.13
    rightGain = 1.12

    WHEEL_DIAM_IN = 24
    DIST_WHEELS_IN = 26

    gyroLeft_smoothed = []
    gyroRight_smoothed = []
    # Apply gains
    for i in range(len(gyroLeft)):
        gyroLeft_smoothed.append(gyroLeft[i] * leftGain)
        gyroRight_smoothed.append(gyroRight[i] * rightGain)

    # Calculate displacement, heading, velocity, and trajectory
    displacement = get_displacement_m(timeStamps, gyroLeft_smoothed,
                                     gyroRight_smoothed, diameter=WHEEL_DIAM_IN, dist_wheels=DIST_WHEELS_IN)
    print(displacement)
    heading = get_heading_deg(timeStamps, gyroLeft_smoothed,
                             gyroRight_smoothed, diameter=WHEEL_DIAM_IN, dist_wheels=DIST_WHEELS_IN)
    velocity = get_velocity_m_s(timeStamps, gyroLeft_smoothed,
                               gyroRight_smoothed, diameter=WHEEL_DIAM_IN, dist_wheels=DIST_WHEELS_IN)
    trajectory = get_top_traj(displacement, velocity, heading,
                             timeStamps, diameter=WHEEL_DIAM_IN, dist_wheels=DIST_WHEELS_IN)
    
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
        "gyroLeft": convert_to_native_types(gyroLeft),
        "gyroRight": convert_to_native_types(gyroRight),
        "timeStamp": convert_to_native_types(timeStamps)
    }
    
    return result


