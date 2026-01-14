"""Gyroscope offset and noise processing helpers.

Provides small, testable utilities used to apply calibration offsets and
zero-out small signals within a multi-sigma noise band. Designed to be
called per-axis for live streaming and saving routines.
"""

from packet_constants import NOISE_THRESHOLD_SIGMAS


def process_gyro_axis(raw_gyro, gyro_offset, gyro_std_dev):
    """Apply calibration offset and 2-sigma noise zeroing to a gyro sample.

    Args:
        raw_gyro: Raw gyro reading (deg/s)
        gyro_offset: Calibration offset to subtract (deg/s)
        gyro_std_dev: Standard deviation estimate for the axis (deg/s)

    Returns:
        dict: {'raw': raw_gyro, 'calibrated': calibrated_value}
    """
    # Remove systematic bias
    calibrated_gyro = raw_gyro - gyro_offset

    # Zero small signals within a multiple of the noise standard deviation
    noise_threshold = gyro_std_dev * NOISE_THRESHOLD_SIGMAS
    if abs(calibrated_gyro) <= noise_threshold:
        calibrated_gyro = 0.0

    return {
        'raw': raw_gyro,
        'calibrated': calibrated_gyro
    }
