import statistics
from collections import deque
from typing import Dict, List, Optional
from packet_constants import (
    CALIBRATION_TARGET_ACCURACY,
    CALIBRATION_STABILITY_WINDOW,
)

class DynamicCalibrator:
    """
    Dynamic calibration that adapts in real-time until target accuracy is achieved.
    Handles calibration for all three gyro axes (gx, gy, gz).
    """
    
    def __init__(self, name: str):
        """
        Initialize calibrator for a specific wheel.
        
        :param name: Wheel name ("left" or "right")
        """
        self.name = name
        
        # Track samples for each gyro axis
        self.samples: Dict[str, List[float]] = {"gx": [], "gy": [], "gz": []}
        self.recent_samples: Dict[str, deque] = {
            "gx": deque(maxlen=CALIBRATION_STABILITY_WINDOW),
            "gy": deque(maxlen=CALIBRATION_STABILITY_WINDOW),
            "gz": deque(maxlen=CALIBRATION_STABILITY_WINDOW)
        }
        
        # Current calibration parameters
        self.current_offset: Dict[str, float] = {"gx": 0.0, "gy": 0.0, "gz": 0.0}
        self.current_std: Dict[str, float] = {"gx": 0.0, "gy": 0.0, "gz": 0.0}
        
        # Timing and convergence tracking
        self.start_time: Optional[float] = None
        self.last_check_time: Optional[float] = None
        self.converged: Dict[str, bool] = {"gx": False, "gy": False, "gz": False}
    
    def add_sample(self, gyro_values: Dict[str, float]) -> None:
        """
        Add gyro samples for all axes and update calibration.
        
        :param gyro_values: Dictionary with "gx", "gy", "gz" keys containing gyro values
        """
        for axis in ["gx", "gy", "gz"]:
            if axis in gyro_values:
                # Apply current offset to get corrected value
                corrected = gyro_values[axis] - self.current_offset[axis]
                
                self.samples[axis].append(gyro_values[axis])
                self.recent_samples[axis].append(corrected)
        
        # Update offset continuously after collecting enough samples
        if all(len(self.samples[axis]) >= 20 for axis in ["gx", "gy", "gz"]):
            self._update_calibration()
    
    def _update_calibration(self) -> None:
        """Update calibration parameters for all axes."""
        for axis in ["gx", "gy", "gz"]:
            if len(self.samples[axis]) > 0:
                self.current_offset[axis] = statistics.mean(self.samples[axis])
                if len(self.samples[axis]) > 1:
                    self.current_std[axis] = statistics.stdev(self.samples[axis])
                else:
                    self.current_std[axis] = 0.0
    
    def check_convergence(self) -> bool:
        """
        Check if calibration has converged to target accuracy for all axes.
        
        :return: True if all axes have converged, False otherwise
        """
        all_converged = True
        
        for axis in ["gx", "gy", "gz"]:
            if len(self.recent_samples[axis]) < CALIBRATION_STABILITY_WINDOW:
                all_converged = False
                continue
            
            # Check if recent corrected samples are close to zero
            recent_mean = abs(statistics.mean(self.recent_samples[axis]))
            recent_std = (statistics.stdev(self.recent_samples[axis]) 
                         if len(self.recent_samples[axis]) > 1 else 0.0)
            
            # Converged if mean is close to zero
            accuracy_achieved = recent_mean < CALIBRATION_TARGET_ACCURACY
            
            if accuracy_achieved and not self.converged[axis]:
                self.converged[axis] = True
                print(f"  {self.name} wheel {axis.upper()} converged! "
                      f"Mean: {recent_mean:.4f} dps, Std: {recent_std:.4f} dps", flush=True)
            
            if not self.converged[axis]:
                all_converged = False
        
        return all_converged
    
    def get_stats(self) -> Dict[str, Dict]:
        """
        Get current calibration statistics for all axes.
        
        :return: Dictionary containing stats for each axis
        """
        stats = {}
        for axis in ["gx", "gy", "gz"]:
            recent_mean = (abs(statistics.mean(self.recent_samples[axis])) 
                          if self.recent_samples[axis] else 0.0)
            recent_std = (statistics.stdev(self.recent_samples[axis]) 
                         if len(self.recent_samples[axis]) > 1 else 0.0)
            
            stats[axis] = {
                "offset": self.current_offset[axis],
                "std_dev": self.current_std[axis],
                "recent_mean": recent_mean,
                "recent_std": recent_std,
                "samples": len(self.samples[axis]),
                "converged": self.converged[axis]
            }
        
        return stats