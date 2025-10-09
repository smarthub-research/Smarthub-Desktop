import numpy as np
import copy
from scipy.fftpack import fftfreq, irfft, rfft

# Load Wheelchair Measurements:
from params import (
    WHEEL_DIAM_IN,
    DIST_WHEELS_IN,
    IN_TO_M
)

def smooth_data(dataValues):
    response = {}
    data = {'timeStamps': copy.deepcopy(dataValues['timeStamps']),
        'gyroLeft': copy.deepcopy(dataValues['gyroLeft']),
        'gyroRight': copy.deepcopy(dataValues['gyroRight'])}

    try:
        # Filtering with low pass filter
        filter_freq =  6
        # Calculate fourier transform of right gyroscope data to convert to frequency domain
        W_right = fftfreq(len(data['gyroRight']), d=data['timeStamps'][1]-data['timeStamps'][0])
        f_gyro_right = rfft(data['gyroRight'])
        # Filter out right gyroscope signal above 6 Hz
        f_right_filtered = f_gyro_right.copy()
        f_right_filtered[(np.abs(W_right)>filter_freq)] = 0
        # convert filtered signal back to time domain
        gyro_right_smoothed = irfft(f_right_filtered)

        response['gyro_right_smoothed'] = list(gyro_right_smoothed)

        # Calculate fourier transform of right gyroscope data to convert to frequency domain
        W_left = fftfreq(len(data['gyroLeft']), d=data['timeStamps'][1]-data['timeStamps'][0])
        f_gyro_left = rfft(data['gyroLeft'])
        # Filter out right gyroscope signal above 6 Hz
        f_left_filtered = f_gyro_left.copy()
        f_left_filtered[(np.abs(W_left)>filter_freq)] = 0
        # convert filtered signal back to time domain
        gyro_left_smoothed = irfft(f_left_filtered)

        data['gyro_left_smoothed'] = gyro_left_smoothed

        response['gyro_left_smoothed'] = list(gyro_left_smoothed)
    except ValueError:
        print('Value error in filtering, retrying')
        return

    return response


def get_displacement_m(timeStamps, gyroLeft, gyroRight, diameter=WHEEL_DIAM_IN, dist_wheels=DIST_WHEELS_IN):
    gyroLeft = np.array(gyroLeft)  # Rotation of left wheel (converted to rps by Arduino)
    gyroRight = np.array(gyroRight)  # Rotation of right wheel (converted to rps by Arduino)
    timeStamps = np.array(timeStamps)  # Time (sec)

    # remove spikes
    # gyro_data[gyro_data > 20] = 0

    gyroLeft = abs(gyroLeft)
    gyroRight = abs(gyroRight)

    dist_m = [0]
        
    for i in range(len(gyroRight) - 1):
        # Wheel rotation in time step:
        dx_r = (gyroLeft[i]+gyroRight[i])/2 * (timeStamps[i + 1] - timeStamps[i])
        # Change in displacement over time step:
        dx_m = dx_r * (diameter * IN_TO_M / 2)
        # Append last change to overall Displacement:
        dist_m.append(dx_m + dist_m[-1])
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