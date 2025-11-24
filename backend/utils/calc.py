import numpy as np

from constants import (
    WHEEL_DIAM_IN,
    DIST_WHEELS_IN,
    IN_TO_M
)

class CalcUtils: 
    def __init__(self) -> None:
        self.last_distance = 0
        self.last_displacement = 0
        self.last_velocity = 0
        self.last_heading = 0
        self.last_dx = 0
        self.last_dy = 0
        self.last_dt = 0

        pass

    def get_displacement_m(self, time_from_start, rot_l, rot_r, diameter=WHEEL_DIAM_IN):

        # Time step
        dt = time_from_start[1] - time_from_start[0]
        
        # Average gyro values from both wheels
        avg_gyro = (rot_l + rot_r) / 2
        
        # Calculate rotation in time step (gyro is in degrees/sec)
        # Convert to rotations by dividing by 360
        dx_rotations = (avg_gyro * dt) / 360
        
        # Calculate displacement: rotations * wheel circumference
        # Circumference = pi * diameter, converted to meters
        dx_m = dx_rotations * np.pi * diameter * IN_TO_M

        
        return dx_m

    def get_distance_m(self, time_from_start, rot_l, rot_r, diameter=WHEEL_DIAM_IN):
        return self.get_displacement_m(time_from_start, abs(rot_l), abs(rot_r), diameter)

    def get_velocity_m_s(self, rot_l, rot_r, diameter=WHEEL_DIAM_IN):
        # Right wheel velocity:
        v_r = (rot_r) * diameter/2*IN_TO_M * (np.pi / 180)
        # Left wheel velocity:
        v_l = (rot_l) * diameter/2*IN_TO_M * (np.pi / 180)
        # Velocity of wheelchair over time:
        v_curr = (v_r+v_l)/2 * (np.pi / 180)
        # Append last change to overall Displacement:
        return v_curr

    def get_heading_deg(self, time_from_start, rot_l, rot_r, diameter=WHEEL_DIAM_IN, dist_wheels=DIST_WHEELS_IN):
        # Angular Velocity in time step (rotating left is positive):
        w = ((rot_r - rot_l) * diameter*IN_TO_M/2 * (np.pi / 180)) / (dist_wheels*IN_TO_M)
        # Change in heading angle over time step:
        dh = w * (time_from_start[1] - time_from_start[0])

        return dh

    def get_top_traj(self, vel_ms, heading_deg, time_from_start):
        '''
        dr = disp_m[i + 1] - disp_m[i]
        dh = heading_deg[i] * np.pi / 180  # radian
        dx += dr * np.cos(dh)
        dy += dr * np.sin(dh)
        '''
        dx = vel_ms * np.cos(heading_deg) * (np.pi / 180) * (time_from_start[1] - time_from_start[0])
        dy = vel_ms * np.sin(heading_deg) * (np.pi / 180) * (time_from_start[1] - time_from_start[0])
        
        return {
            "x": dx, 
            "y": dy
        }
