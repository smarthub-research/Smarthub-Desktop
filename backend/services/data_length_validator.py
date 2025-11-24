from typing import Dict
from services.data_validator import IDataValidator

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