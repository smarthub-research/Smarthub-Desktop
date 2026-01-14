"""Signal filtering utilities for gyro and time-series data.

Provides a small set of filters used by the processing pipeline:
- `DeadZoneFilter` — hysteresis-based dead-zone to suppress low-level noise
- `BiasEstimatingKalmanFilter` — 2-state filter estimating velocity and bias
- `FFTLowPassFilter` — convenience FFT-based low-pass smoothing

Helpers are intentionally lightweight and expect callers to manage
persistence of filter instances where required (e.g. Kalman filters).
"""

import numpy as np
from abc import ABC, abstractmethod
from scipy.fftpack import fftfreq, irfft, rfft
from typing import Dict, List
from packet_constants import GYRO_DEAD_ZONE, GYRO_HYSTERESIS


class ISignalFilter(ABC):
    """Interface for signal filtering implementations."""

    @abstractmethod
    def filter(self, signal: List[float], time_data: List[float]) -> np.ndarray:
        """Apply filtering to `signal` using `time_data` spacing."""
        pass


class DeadZoneFilter:
    """Dead zone with hysteresis to prevent noise-induced drift at low speeds.

    Use by passing scalar gyro values into `filter(value)`; the filter keeps
    internal `in_motion` state and returns 0 while below the thresholds.
    """

    def __init__(self, dead_zone=GYRO_DEAD_ZONE, hysteresis=GYRO_HYSTERESIS):
        self.dead_zone = dead_zone  # deg/s
        self.hysteresis = hysteresis
        self.in_motion = False

    def filter(self, value):
        """Apply dead zone with simple hysteresis logic."""
        if self.in_motion:
            # Once moving, require value to drop below lower threshold to stop
            if abs(value) < self.dead_zone - self.hysteresis:
                self.in_motion = False
                return 0.0
        else:
            # While stopped, require value to exceed upper threshold to start
            if abs(value) > self.dead_zone + self.hysteresis:
                self.in_motion = True
            else:
                return 0.0

        return value

    def reset(self):
        """Reset the motion state to 'stopped'."""
        self.in_motion = False


class BiasEstimatingKalmanFilter:
    """Two-state Kalman filter estimating angular velocity and a constant bias.

    State vector: [angular_velocity, bias]
    Measurement: z = angular_velocity + bias + noise
    """

    def __init__(self, process_noise_velocity, process_noise_bias, measurement_noise):
        """Initialize filter matrices and state."""
        # State: [angular_velocity, bias]
        self.x = np.array([0.0, 0.0])

        # State covariance matrix
        self.P = np.array([[1.0, 0.0],
                          [0.0, 1.0]])

        # Process noise covariance
        self.Q = np.array([[process_noise_velocity, 0.0],
                          [0.0, process_noise_bias]])

        # Measurement noise variance
        self.R = measurement_noise

        # Identity-like state transition (random walk model)
        self.F = np.array([[1.0, 0.0],
                          [0.0, 1.0]])

        # Measurement matrix: z = [1, 1] @ [vel, bias]
        self.H = np.array([1.0, 1.0])

    def predict(self):
        """Prediction step: propagate covariance with process noise."""
        self.P = self.F @ self.P @ self.F.T + self.Q

    def update(self, measurement):
        """Update step with a scalar gyro measurement (deg/s)."""
        y = measurement - self.H @ self.x
        S = self.H @ self.P @ self.H.T + self.R
        K = self.P @ self.H / S
        self.x = self.x + K * y
        self.P = (np.eye(2) - np.outer(K, self.H)) @ self.P

    def get_velocity(self):
        """Return estimated angular velocity (deg/s), bias removed."""
        return self.x[0]

    def get_bias(self):
        """Return estimated bias (deg/s)."""
        return self.x[1]

    def reset(self):
        """Reset state and covariance to defaults."""
        self.x = np.array([0.0, 0.0])
        self.P = np.array([[1.0, 0.0],
                          [0.0, 1.0]])


def process_gyro_kalman(raw_value, kf):
    """Process a single gyro sample with a persistent Kalman filter.

    Returns a dict with raw, filtered (velocity), and bias estimates.
    """
    kf.predict()
    kf.update(raw_value)
    filtered_velocity = kf.get_velocity()
    estimated_bias = kf.get_bias()

    return {
        'raw': raw_value,
        'filtered': filtered_velocity,
        'bias': estimated_bias
    }


class FFTLowPassFilter(ISignalFilter):
    """FFT-based low-pass filter implementation for evenly sampled signals."""

    def __init__(self, cutoff_freq: float = 6.0):
        self._cutoff_freq = cutoff_freq

    def filter(self, signal: List[float], time_data: List[float]) -> np.ndarray:
        """Apply FFT low-pass smoothing and return numpy array result."""
        W = fftfreq(len(signal), d=time_data[1] - time_data[0])
        f_signal = rfft(signal)
        f_filtered = f_signal.copy()
        f_filtered[np.abs(W) > self._cutoff_freq] = 0
        signal_smoothed = irfft(f_filtered)
        return signal_smoothed


def smooth_data(data: dict, cutoff_freq: float = 6.0) -> dict:
    """Helper that smooths left/right gyro arrays in a tolerant way.

    The function accepts multiple naming conventions for time and gyro keys
    and returns numpy arrays under the keys 'gyro_right_smoothed' and
    'gyro_left_smoothed'. If input arrays are too short for FFT, the
    originals are returned as numpy arrays.
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

    if time_data is None:
        raise KeyError("No time array found in data for smoothing")

    import numpy as _np

    if gyro_right is None or gyro_left is None:
        return {
            "gyro_right_smoothed": _np.array([]),
            "gyro_left_smoothed": _np.array([]),
        }

    if len(time_data) < 2 or len(gyro_right) < 2 or len(gyro_left) < 2:
        return {
            "gyro_right_smoothed": _np.array(gyro_right),
            "gyro_left_smoothed": _np.array(gyro_left),
        }

    filt = FFTLowPassFilter(cutoff_freq=cutoff_freq)

    try:
        right_sm = filt.filter(list(gyro_right), list(time_data))
    except Exception:
        right_sm = _np.array(gyro_right)

    try:
        left_sm = filt.filter(list(gyro_left), list(time_data))
    except Exception:
        left_sm = _np.array(gyro_left)

    return {
        "gyro_right_smoothed": _np.array(right_sm),
        "gyro_left_smoothed": _np.array(left_sm),
    }
