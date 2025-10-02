import numpy as np
from scipy.fftpack import fftfreq, irfft, rfft

# Load Wheelchair Measurements:
from params import (
    WHEEL_DIAM_IN,
    DIST_WHEELS_IN,
    IN_TO_M
)

def smooth_data(data):
    response = {}
    
    # Check if we have enough data points
    if len(data['time_from_start']) < 2 or len(data['gyro_right']) == 0 or len(data['gyro_left']) == 0:
        # Return empty smoothed data if insufficient data
        response['gyro_right_smoothed'] = []
        response['gyro_left_smoothed'] = []
        return response
    
    # Filtering with low pass filter
    filter_freq =  6
    
    # Calculate time step
    dt = data['time_from_start'][1] - data['time_from_start'][0]
    
    # Calculate fourier transform of right gyroscope data to convert to frequency domain
    W_right = fftfreq(len(data['gyro_right']), d=dt)
    f_gyro_right = rfft(data['gyro_right'])
    # Filter out right gyroscope signal above 6 Hz
    f_right_filtered = f_gyro_right.copy()
    f_right_filtered[(np.abs(W_right)>filter_freq)] = 0
    # convert filtered signal back to time domain
    gyro_right_smoothed = irfft(f_right_filtered)

    response['gyro_right_smoothed'] = list(gyro_right_smoothed)

    # Calculate fourier transform of left gyroscope data to convert to frequency domain
    W_left = fftfreq(len(data['gyro_left']), d=dt)
    f_gyro_left = rfft(data['gyro_left'])
    # Filter out left gyroscope signal above 6 Hz
    f_left_filtered = f_gyro_left.copy()
    f_left_filtered[(np.abs(W_left)>filter_freq)] = 0
    # convert filtered signal back to time domain
    gyro_left_smoothed = irfft(f_left_filtered)

    response['gyro_left_smoothed'] = list(gyro_left_smoothed)

    return response

def get_displacement_m(time_from_start, rot_l, rot_r, diameter=WHEEL_DIAM_IN, dist_wheels=DIST_WHEELS_IN):
    rot_l = np.array(rot_l)  # Rotation of left wheel (converted to rps by Arduino)
    rot_r = np.array(rot_r)  # Rotation of right wheel (converted to rps by Arduino)
    time_from_start = np.array(time_from_start)  # Time (sec)

    # remove spikes
    # gyro_data[gyro_data > 20] = 0

    dist_m = [0]
    for i in range(len(rot_r) - 1):
        # Wheel rotation in time step:
        dx_r = (rot_l[i]+rot_r[i])/2 * (time_from_start[i + 1] - time_from_start[i])
        # Change in displacement over time step:
        dx_m = dx_r * (diameter * IN_TO_M / 2)
        # Append last change to overall Displacement:
        dist_m.append(dx_m + dist_m[-1])
    return dist_m


def get_distance_m(time_from_start, rot_l, rot_r, diameter=WHEEL_DIAM_IN, dist_wheels=DIST_WHEELS_IN):
    rot_l = np.array(rot_l)  # Rotation of left wheel (converted to rps by Arduino)
    rot_r = np.array(rot_r)  # Rotation of right wheel (converted to rps by Arduino)
    time_from_start = np.array(time_from_start)  # Time (sec)
    # Remove direction to just get distance travelled:
    rot_l = abs(rot_l)
    rot_r = abs(rot_r)

    # remove spikes
    # gyro_data[gyro_data > 20] = 0

    dist_m = [0]
    for i in range(len(rot_r) - 1):
        # Wheel rotation in time step:
        dx_r = (rot_l[i]+rot_r[i])/2 * (time_from_start[i + 1] - time_from_start[i])
        # Change in distance over time step:
        dx_m = dx_r * (diameter * IN_TO_M / 2)
        # Append last change to overall distance travelled:
        dist_m.append(dx_m + dist_m[-1])
    return dist_m


def get_velocity_m_s(time_from_start, rot_l, rot_r, diameter=WHEEL_DIAM_IN, dist_wheels=DIST_WHEELS_IN):
    rot_l = np.array(rot_l)  # Rotation of left wheel (converted to rps by Arduino)
    rot_r = np.array(rot_r)  # Rotation of right wheel (converted to rps by Arduino)
    time_from_start = np.array(time_from_start)  # Time (sec)

    # remove spikes
    # gyro_data[gyro_data > 20] = 0

    vel_ms = [0]
    for i in range(len(rot_r) - 1):
        # Right wheel velocity:
        v_r = (rot_r[i]) * diameter/2*IN_TO_M
        # Left wheel velocity:
        v_l = (rot_l[i]) * diameter/2*IN_TO_M
        # Velocity of wheelchair over time:
        v_curr = (v_r+v_l)/2
        # Append last change to overall Displacement:
        vel_ms.append(v_curr)
    return vel_ms


def get_heading_deg(time_from_start, rot_l, rot_r, diameter=WHEEL_DIAM_IN, dist_wheels=DIST_WHEELS_IN):
    rot_l = np.array(rot_l)  # Rotation of left wheel (converted to rps by Arduino)
    rot_r = np.array(rot_r)  # Rotation of right wheel (converted to rps by Arduino)
    time_from_start = np.array(time_from_start)  # Time (sec)

    heading_deg = [0]
    for i in range(len(rot_r) - 1):
        # Angular Velocity in time step (rotating left is positive):
        w = ((rot_r[i]-rot_l[i]) * diameter*IN_TO_M/2) / (dist_wheels*IN_TO_M)
        # Change in heading angle over time step:
        dh = w * (time_from_start[i + 1] - time_from_start[i])
        # convert to degrees:
        dh = dh*180/np.pi
        # Append last change to overall heading angle:
        heading_deg.append(dh + heading_deg[-1])
    return heading_deg


def get_top_traj(disp_m, vel_ms, heading_deg, time_from_start, diameter=WHEEL_DIAM_IN, dist_wheels=DIST_WHEELS_IN):
    x, y = [], []
    dx, dy = 0, 0

    for i in range(len(disp_m) - 1):
        '''
        dr = disp_m[i + 1] - disp_m[i]
        dh = heading_deg[i] * np.pi / 180  # radian
        dx += dr * np.cos(dh)
        dy += dr * np.sin(dh)
        '''
        dx += vel_ms[i]*np.cos(heading_deg[i]*np.pi/180) * (time_from_start[i + 1] - time_from_start[i])
        dy += vel_ms[i]*np.sin(heading_deg[i]*np.pi/180) * (time_from_start[i + 1] - time_from_start[i])
        x.append(dx)
        y.append(dy)
    traj = [[x[i], y[i]] for i in range(len(x))]
    return traj