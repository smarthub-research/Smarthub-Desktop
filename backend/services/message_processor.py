import copy
from typing import Dict
import numpy as np

from utils.calc import CalcUtils
from utils.filtering import DeadZoneFilter
from services.data_length_validator import IDataValidator

class DataProcessor:
    """
    Processes raw sensor data using dependency injection.
    Single Responsibility: Orchestrate data processing steps.
    Dependency Inversion: Depends on abstractions (validator, filter) not concrete implementations.
    """
    
    def __init__(self, validator: IDataValidator):
        """
        Initialize processor with dependencies.
        
        :param validator: Data validator implementation
        :param signal_filter: Signal filter implementation
        """
        self._validator = validator
        self._calc_utils = CalcUtils()
        self.prev_timestamp = None

        self.total_distance = 0
        self.total_displacement = 0
        
        self.last_heading = 0
        self.last_traj_x = 0
        self.last_traj_y = 0

        # DeadZone filter for motion detection (applied to average of both wheels)
        self.gyro_deadzone = DeadZoneFilter()


    
    def reset_calculations(self):
        """
        Reset the calculation state for a new test.
        This clears all accumulated values from previous packets.
        """
        self._calc_utils = CalcUtils()
        self.prev_timestamp = None
        self.total_distance = 0
        self.total_displacement = 0
        self.last_heading = 0
        self.last_traj_x = 0
        self.last_traj_y = 0
    
    def process_data(self, raw_data: Dict, left_gain: float, right_gain: float, 
                     diameter: float, dist_wheels: float) -> Dict:
        """
        Process raw sensor data to calculate all derived values.
        
        :param raw_data: dictionary with time_from_start, gyro_left, gyro_right
               left_gain: gain calibration for left wheel
               right_gain: gain calibration for right wheel
               diameter: wheel diameter in inches
               dist_wheels: distance between wheels in inches
        :returns dictionary with all processed data
        """
        # Make a safe copy to avoid race conditions
        data = {
            'time_from_start': copy.deepcopy(raw_data['time_from_start']),
            'gyro_left': copy.deepcopy(raw_data['gyro_left']),
            'gyro_right': copy.deepcopy(raw_data['gyro_right'])
        }
        
        # Validate data lengths
        if not self._validator.validate(data):
            return {}
        
        if len(data['time_from_start']) < 2:
            return {}
        
        try:
            right_gy_calibrated = data['gyro_right']
            left_gy_calibrated = data['gyro_left']


            distance = []
            displacement = []
            packet_velocity = []
            trajectory_x = []
            trajectory_y = []
            heading = []
            for i in range(len(left_gy_calibrated)):
                self.gyro_deadzone.filter(np.mean([left_gy_calibrated, right_gy_calibrated]))
                in_motion = self.gyro_deadzone.in_motion
                # Calculate all derived values using the instance calc_utils
                if self.prev_timestamp is not None:
                    if in_motion:
                        self.total_distance += self._calc_utils.get_distance_m(
                            [self.prev_timestamp, data['time_from_start'][i]], 
                            left_gy_calibrated[i],
                            right_gy_calibrated[i], 
                            diameter=diameter
                        )
                        
                        self.total_displacement += self._calc_utils.get_displacement_m(
                            [self.prev_timestamp, data['time_from_start'][i]], 
                            left_gy_calibrated[i],
                            right_gy_calibrated[i], 
                            diameter=diameter
                        )
                        
                        heading_deg = self._calc_utils.get_heading_deg(
                            [self.prev_timestamp, data['time_from_start'][i]], 
                            left_gy_calibrated[i],
                            right_gy_calibrated[i], 
                            diameter=diameter, 
                            dist_wheels=dist_wheels
                        )
                        
                        velocity = self._calc_utils.get_velocity_m_s(
                            left_gy_calibrated[i],
                            right_gy_calibrated[i], 
                            diameter=diameter
                        )
                        
                        trajectory = self._calc_utils.get_top_traj(
                            velocity, 
                            heading_deg,
                            [self.prev_timestamp, data['time_from_start'][i]], 
                        )
                        
                        self.last_heading = heading_deg
                        self.last_traj_x = trajectory['x']
                        self.last_traj_y = trajectory['y']
                        
                        packet_velocity.append(velocity)
                        trajectory_x.append(trajectory['x'])
                        trajectory_y.append(trajectory['y'])
                        distance.append(self.total_distance)
                        displacement.append(self.total_displacement)
                        heading.append(heading_deg)
                    else:
                        packet_velocity.append(0)
                        trajectory_x.append(self.last_traj_x)
                        trajectory_y.append(self.last_traj_y)
                        distance.append(self.total_distance)
                        displacement.append(self.total_displacement)
                        heading.append(self.last_heading)

                self.prev_timestamp = data['time_from_start'][i]
            
            return {
                'time_from_start': data['time_from_start'],
                'dist_m': distance,
                'disp_m': displacement,
                'heading_deg': heading,
                'velocity': packet_velocity,
                'trajectory': {
                    'x': trajectory_x,
                    'y': trajectory_y
                }
            }
            
        except ValueError as e:
            print(f'Value error in processing: {e}')
            return {}
