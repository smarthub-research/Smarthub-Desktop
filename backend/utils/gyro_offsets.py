"""
Simple gyroscope processing module for SmartHub data
Handles calibration offset removal and 2-sigma noise zeroing for all gyro axes
"""
from packet_constants import NOISE_THRESHOLD_SIGMAS

def process_gyro_axis(raw_gyro, gyro_offset, gyro_std_dev):
    """
    Process any gyro axis with uniform calibration + 2-sigma zeroing
    
    Args:
        raw_gyro: Raw gyro reading
        gyro_offset: Calibration offset to remove  
        gyro_std_dev: Standard deviation for noise threshold
        
    Returns:
        dict with 'raw' and 'calibrated' values
    """
    # Stage 1: Remove calibration offset (systematic bias)
    calibrated_gyro = raw_gyro - gyro_offset
    
    # Stage 2: Apply 2-sigma noise zeroing
    noise_threshold = gyro_std_dev * NOISE_THRESHOLD_SIGMAS
    if abs(calibrated_gyro) <= noise_threshold:
        calibrated_gyro = 0.0
    
    return {
        'raw': raw_gyro,
        'calibrated': calibrated_gyro
    }
