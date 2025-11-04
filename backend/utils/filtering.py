import numpy as np
from abc import ABC, abstractmethod
from scipy.fftpack import fftfreq, irfft, rfft
from typing import Dict, List

class ISignalFilter(ABC):
    """Interface for signal filtering (Interface Segregation Principle)"""
    
    @abstractmethod
    def filter(self, signal: List[float], time_data: List[float]) -> np.ndarray:
        """Apply filtering to signal"""
        pass


class FFTLowPassFilter(ISignalFilter):
    """
    FFT-based low-pass filter implementation.
    Single Responsibility: Only handles FFT filtering.
    """
    
    def __init__(self, cutoff_freq: float = 6.0):
        """
        Initialize filter with cutoff frequency.
        
        :param cutoff_freq: Cutoff frequency in Hz
        """
        self._cutoff_freq = cutoff_freq
    
    def filter(self, signal: List[float], time_data: List[float]) -> np.ndarray:
        """
        Apply FFT-based low-pass filter to signal data.
        
        :param signal: list of signal values
        :param time_data: list of time values
        :returns filtered signal as numpy array
        """
        # Calculate frequency domain
        W = fftfreq(len(signal), d=time_data[1] - time_data[0])
        f_signal = rfft(signal)
        
        # Filter out signal above cutoff frequency
        f_filtered = f_signal.copy()
        f_filtered[np.abs(W) > self._cutoff_freq] = 0
        
        # Convert back to time domain
        signal_smoothed = irfft(f_filtered)
        
        return signal_smoothed


def smooth_data(data: dict, cutoff_freq: float = 6.0) -> dict:
    """
    Convenience helper to smooth left/right gyro arrays found in various
    input formats used across the codebase. Returns a dict with keys
    'gyro_right_smoothed' and 'gyro_left_smoothed' (numpy arrays).

    This helper is tolerant to different naming conventions used in
    different modules (e.g. 'time_from_start' vs 'timeStamps',
    'gyro_right' vs 'gyroRight').
    """
    # find time array
    time_keys = ["time_from_start", "timeFromStart", "timeStamps", "time_stamps", "timestamps", "timeStamps"]
    time_data = None
    for k in time_keys:
        if k in data:
            time_data = data[k]
            break

    # find gyro arrays (right/left)
    right_keys = ["gyro_right", "gyroRight", "gyro_right_smoothed", "gyroRightSmoothed", "gyroRight"]
    left_keys = ["gyro_left", "gyroLeft", "gyro_left_smoothed", "gyroLeftSmoothed", "gyroLeft"]

    gyro_right = None
    gyro_left = None
    for k in right_keys:
        if k in data:
            gyro_right = data[k]
            break
    for k in left_keys:
        if k in data:
            gyro_left = data[k]
            break

    # Fallbacks - if nothing found, try common uppercase/lowercase combos
    if time_data is None:
        raise KeyError("No time array found in data for smoothing")

    # Ensure arrays are numpy arrays
    import numpy as _np

    # If either gyro missing, return empty arrays to avoid crashes
    if gyro_right is None or gyro_left is None:
        return {
            "gyro_right_smoothed": _np.array([]),
            "gyro_left_smoothed": _np.array([]),
        }

    # short-circuit: if not enough samples, return copies
    if len(time_data) < 2 or len(gyro_right) < 2 or len(gyro_left) < 2:
        return {
            "gyro_right_smoothed": _np.array(gyro_right),
            "gyro_left_smoothed": _np.array(gyro_left),
        }

    filt = FFTLowPassFilter(cutoff_freq=cutoff_freq)

    try:
        right_sm = filt.filter(list(gyro_right), list(time_data))
    except Exception:
        # Safety: if FFT fails, fallback to returning original
        right_sm = _np.array(gyro_right)

    try:
        left_sm = filt.filter(list(gyro_left), list(time_data))
    except Exception:
        left_sm = _np.array(gyro_left)

    return {
        "gyro_right_smoothed": _np.array(right_sm),
        "gyro_left_smoothed": _np.array(left_sm),
    }
