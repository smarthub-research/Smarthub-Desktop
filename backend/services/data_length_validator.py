"""Concrete data validator that checks array lengths.

This validator ensures that the time array and sensor arrays have matching
lengths before the `DataProcessor` performs numeric calculations. Keeping
this concern isolated makes unit-testing and future validators simple.
"""

from typing import Dict
from services.data_validator import IDataValidator


class DataLengthValidator(IDataValidator):
    """Validates that all data arrays have matching lengths."""

    def validate(self, data: Dict) -> bool:
        """Return True if all lengths match, otherwise log and return False."""
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