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
    if len(data['timeStamps']) < 2 or len(data['gyroRight']) == 0 or len(data['gyroLeft']) == 0:
        # Return empty smoothed data if insufficient data
        response['gyroRight_smoothed'] = []
        response['gyroLeft_smoothed'] = []
        return response
    
    # Filtering with low pass filter
    filter_freq =  6
    
    # Calculate time step
    dt = data['timeStamps'][1] - data['timeStamps'][0]
    
    # Calculate fourier transform of right gyroscope data to convert to frequency domain
    W_right = fftfreq(len(data['gyroRight']), d=dt)
    f_gyroRight = rfft(data['gyroRight'])
    # Filter out right gyroscope signal above 6 Hz
    f_right_filtered = f_gyroRight.copy()
    f_right_filtered[(np.abs(W_right)>filter_freq)] = 0
    # convert filtered signal back to time domain
    gyroRight_smoothed = irfft(f_right_filtered)

    response['gyroRight_smoothed'] = list(gyroRight_smoothed)

    # Calculate fourier transform of left gyroscope data to convert to frequency domain
    W_left = fftfreq(len(data['gyroLeft']), d=dt)
    f_gyroLeft = rfft(data['gyroLeft'])
    # Filter out left gyroscope signal above 6 Hz
    f_left_filtered = f_gyroLeft.copy()
    f_left_filtered[(np.abs(W_left)>filter_freq)] = 0
    # convert filtered signal back to time domain
    gyroLeft_smoothed = irfft(f_left_filtered)

    response['gyroLeft_smoothed'] = list(gyroLeft_smoothed)

    return response


lastDisplacement = None
def get_displacement_m(timeStamps, gyroLeft, gyroRight, diameter=WHEEL_DIAM_IN, dist_wheels=DIST_WHEELS_IN):
    gyroLeft = np.array(gyroLeft)  # Rotation of left wheel (converted to rps by Arduino)
    gyroRight = np.array(gyroRight)  # Rotation of right wheel (converted to rps by Arduino)
    timeStamps = np.array(timeStamps)  # Time (sec)

    # remove spikes
    # gyro_data[gyro_data > 20] = 0

    gyroLeft = abs(gyroLeft)
    gyroRight = abs(gyroRight)

    if lastDisplacement:
        dist_m = [lastDisplacement]
    else:
        dist_m = [0]
        
    for i in range(len(gyroRight) - 1):
        # Wheel rotation in time step:
        dx_r = (gyroLeft[i]+gyroRight[i])/2 * (timeStamps[i + 1] - timeStamps[i])
        # Change in displacement over time step:
        dx_m = dx_r * (diameter * IN_TO_M / 2)
        # Append last change to overall Displacement:
        dist_m.append(dx_m + dist_m[-1])
    lastDisplacement = dist_m[-1]
    return dist_m

def get_velocity_m_s(timeStamps, gyroLeft, gyroRight, diameter=WHEEL_DIAM_IN, dist_wheels=DIST_WHEELS_IN):
    gyroLeft = np.array(gyroLeft)  # Rotation of left wheel (converted to rps by Arduino)
    gyroRight = np.array(gyroRight)  # Rotation of right wheel (converted to rps by Arduino)
    timeStamps = np.array(timeStamps)  # Time (sec)

    # remove spikes
    # gyro_data[gyro_data > 20] = 0

    vel_ms = [0]
    for i in range(len(gyroRight) - 1):
        # Right wheel velocity:
        v_r = (gyroRight[i]) * diameter/2*IN_TO_M
        # Left wheel velocity:
        v_l = (gyroLeft[i]) * diameter/2*IN_TO_M
        # Velocity of wheelchair over time:
        v_curr = (v_r+v_l)/2
        # Append last change to overall Displacement:
        vel_ms.append(v_curr)
    return vel_ms


def get_heading_deg(timeStamps, gyroLeft, gyroRight, diameter=WHEEL_DIAM_IN, dist_wheels=DIST_WHEELS_IN):
    gyroLeft = np.array(gyroLeft)  # Rotation of left wheel (converted to rps by Arduino)
    gyroRight = np.array(gyroRight)  # Rotation of right wheel (converted to rps by Arduino)
    timeStamps = np.array(timeStamps)  # Time (sec)

    heading_deg = [0]
    for i in range(len(gyroRight) - 1):
        # Angular Velocity in time step (rotating left is positive):
        w = ((gyroRight[i]-gyroLeft[i]) * diameter*IN_TO_M/2) / (dist_wheels*IN_TO_M)
        # Change in heading angle over time step:
        dh = w * (timeStamps[i + 1] - timeStamps[i])
        # convert to degrees:
        dh = dh*180/np.pi
        # Append last change to overall heading angle:
        heading_deg.append(dh + heading_deg[-1])
    return heading_deg


def get_top_traj(disp_m, vel_ms, heading_deg, timeStamps, diameter=WHEEL_DIAM_IN, dist_wheels=DIST_WHEELS_IN):
    x, y = [], []
    dx, dy = 0, 0

    for i in range(len(disp_m) - 1):
        '''
        dr = disp_m[i + 1] - disp_m[i]
        dh = heading_deg[i] * np.pi / 180  # radian
        dx += dr * np.cos(dh)
        dy += dr * np.sin(dh)
        '''
        dx += vel_ms[i]*np.cos(heading_deg[i]*np.pi/180) * (timeStamps[i + 1] - timeStamps[i])
        dy += vel_ms[i]*np.sin(heading_deg[i]*np.pi/180) * (timeStamps[i + 1] - timeStamps[i])
        x.append(dx)
        y.append(dy)
    traj = [[x[i], y[i]] for i in range(len(x))]
    return traj