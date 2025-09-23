from fastapi import APIRouter
from calc import get_displacement_m, get_distance_m, get_velocity_m_s, get_heading_deg, get_top_traj
from .calibrate import smooth_packet
from scipy.fftpack import fftfreq, irfft, rfft
import numpy as np

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
    
    # smoothed = await smooth_packet(data)
    # print(smoothed)
    # Check if calibration data has the required gain values, use defaults if not
    calibration = data.get("calibration", {})
    right_gain = calibration.get("right_gain", 1.0)  # Default to 1.0 if not present
    left_gain = calibration.get("left_gain", 1.0)    # Default to 1.0 if not present

    # Apply gain to each element in the smoothed arrays
    data["gyro_right"] = [x * right_gain for x in data["gyro_right"]]
    data["gyro_left"] = [x * left_gain for x in data["gyro_left"]]

    # Default wheel_distance if not present
    wheel_distance = calibration.get("wheel_distance", 24)  # Default to 24 if not present

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

