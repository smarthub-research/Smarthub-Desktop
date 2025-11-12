import copy
from abc import ABC, abstractmethod
from typing import Dict

from utils.calc import CalcUtils
from utils.filtering import ISignalFilter

class IDataValidator(ABC):
    """Interface for data validation (Interface Segregation Principle)"""
    
    @abstractmethod
    def validate(self, data: Dict) -> bool:
        """Validate input data"""
        pass


class DataLengthValidator(IDataValidator):
    """
    Validates that all data arrays have matching lengths.
    Single Responsibility: Only validates data lengths.
    """
    
    def validate(self, data: Dict) -> bool:
        """
        Check if all data arrays have matching lengths.
        
        :param data: dictionary containing time_from_start, gyro_left, gyro_right
        :returns True if all lengths match, False otherwise
        """
        if len(data['time_from_start']) != len(data['gyro_left']):
            print('Data length mismatch: time vs gyro_left')
            return False
        if len(data['time_from_start']) != len(data['gyro_right']):
            print('Data length mismatch: time vs gyro_right')
            return False
        if len(data['gyro_left']) != len(data['gyro_right']):
            print('Data length mismatch: gyro_left vs gyro_right')
            return False
        return True
class DataProcessor:
    """
    Processes raw sensor data using dependency injection.
    Single Responsibility: Orchestrate data processing steps.
    Dependency Inversion: Depends on abstractions (validator, filter) not concrete implementations.
    """
    
    def __init__(self, validator: IDataValidator, signal_filter: ISignalFilter):
        """
        Initialize processor with dependencies.
        
        :param validator: Data validator implementation
        :param signal_filter: Signal filter implementation
        """
        self._validator = validator
        self._filter = signal_filter
        self._calc_utils = CalcUtils()  # Initialize CalcUtils to maintain state across packets
    
    def reset_calculations(self):
        """
        Reset the calculation state for a new test.
        This clears all accumulated values from previous packets.
        """
        self._calc_utils = CalcUtils()
    
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
            # Apply low-pass filtering using injected filter
            gyro_left_smoothed = self._filter.filter(
                data['gyro_left'], 
                data['time_from_start']
            )
            gyro_right_smoothed = self._filter.filter(
                data['gyro_right'], 
                data['time_from_start']
            )
            
            # Apply gain calibration
            gyro_right_smoothed = gyro_right_smoothed * right_gain
            gyro_left_smoothed = gyro_left_smoothed * left_gain

            
            # Calculate all derived values using the instance calc_utils
            dist_m = self._calc_utils.get_distance_m(
                data['time_from_start'], 
                gyro_left_smoothed,
                gyro_right_smoothed, 
                diameter=diameter
            )
            
            disp_m = self._calc_utils.get_displacement_m(
                data['time_from_start'], 
                gyro_left_smoothed,
                gyro_right_smoothed, 
                diameter=diameter
            )
            
            heading_deg = self._calc_utils.get_heading_deg(
                data['time_from_start'], 
                gyro_left_smoothed,
                gyro_right_smoothed, 
                diameter=diameter, 
                dist_wheels=dist_wheels
            )
            
            velocity = self._calc_utils.get_velocity_m_s(
                data['time_from_start'], 
                gyro_left_smoothed,
                gyro_right_smoothed, 
                diameter=diameter
            )
            
            trajectory = self._calc_utils.get_top_traj(
                disp_m, 
                velocity, 
                heading_deg,
                data['time_from_start'], 
            )
            
            return {
                'time_from_start': data['time_from_start'],
                'gyro_left_smoothed': gyro_left_smoothed,
                'gyro_right_smoothed': gyro_right_smoothed,
                'dist_m': dist_m,
                'disp_m': disp_m,
                'heading_deg': heading_deg,
                'velocity': velocity,
                'trajectory': trajectory
            }
            
        except ValueError as e:
            print(f'Value error in processing: {e}')
            return {}
