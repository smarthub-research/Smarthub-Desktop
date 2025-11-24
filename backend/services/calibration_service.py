"""
Dynamic calibration service for SmartHub gyroscopes.
Implements real-time calibration that adapts until target accuracy is achieved.
"""
import time
from typing import Dict, List, Optional
from packet_constants import (
    CALIBRATION_MIN_DURATION,
    CALIBRATION_MAX_DURATION,
    CALIBRATION_CHECK_INTERVAL
)

from services.dynamic_calibration import DynamicCalibrator

class CalibrationService:
    """
    Service to manage dynamic calibration for both SmartHub wheels.
    Processes incoming packets and tracks calibration progress.
    """
    
    def __init__(self):
        """Initialize calibration service."""
        self.left_calibrator: Optional[DynamicCalibrator] = None
        self.right_calibrator: Optional[DynamicCalibrator] = None
        self.is_calibrating = False
        self.calibration_start_time: Optional[float] = None
        self.last_status_time: Optional[float] = None
    
    def start_calibration(self) -> None:
        """Start a new calibration session for both wheels."""
        print("\n=== Dynamic Calibration Started ===", flush=True)
        print("Both wheels will be calibrated until they reach target accuracy", flush=True)
        print("This may take 10-120 seconds depending on sensor stability", flush=True)
        print("Keep wheels stationary...", flush=True)
        
        self.left_calibrator = DynamicCalibrator("left")
        self.right_calibrator = DynamicCalibrator("right")
        self.is_calibrating = True
        self.calibration_start_time = time.time()
        self.last_status_time = time.time()
    
    def stop_calibration(self) -> Dict:
        """
        Stop calibration and return final results.
        
        :return: Dictionary containing calibration results for both wheels
        """
        self.is_calibrating = False
        
        if not (self.left_calibrator and self.right_calibrator):
            return {}
        
        left_stats = self.left_calibrator.get_stats()
        right_stats = self.right_calibrator.get_stats()
        
        print("\n=== Dynamic Calibration Complete ===", flush=True)
        print(f"Left wheel calibration:", flush=True)
        for axis in ["gx", "gy", "gz"]:
            stats = left_stats[axis]
            print(f"  {axis.upper()} - Offset: {stats['offset']:.6f} dps, "
                  f"Std dev: {stats['std_dev']:.6f} dps, "
                  f"Accuracy: ±{stats['recent_mean']:.6f} dps", flush=True)
        
        print(f"Right wheel calibration:", flush=True)
        for axis in ["gx", "gy", "gz"]:
            stats = right_stats[axis]
            print(f"  {axis.upper()} - Offset: {stats['offset']:.6f} dps, "
                  f"Std dev: {stats['std_dev']:.6f} dps, "
                  f"Accuracy: ±{stats['recent_mean']:.6f} dps", flush=True)
        
        elapsed = time.time() - (self.calibration_start_time or time.time())
        print(f"Total time: {elapsed:.1f}s", flush=True)
        
        # Extract offsets and std_devs BEFORE cleaning up calibrators
        offsets = {
            "left": self.left_calibrator.current_offset.copy(),
            "right": self.right_calibrator.current_offset.copy()
        }
        std_devs = {
            "left": self.left_calibrator.current_std.copy(),
            "right": self.right_calibrator.current_std.copy()
        }
        
        results = {
            "left": left_stats,
            "right": right_stats,
            "duration": elapsed,
            "all_converged": (all(left_stats[ax]["converged"] for ax in ["gx", "gy", "gz"]) and
                            all(right_stats[ax]["converged"] for ax in ["gx", "gy", "gz"])),
            "offsets": offsets,
            "std_devs": std_devs
        }
        
        # Clean up AFTER extracting all data
        self.left_calibrator = None
        self.right_calibrator = None
        self.calibration_start_time = None
        self.last_status_time = None
        
        return results
    
    def process_packet(self, side: str, samples: List[Dict[str, float]]) -> bool:
        """
        Process a packet during calibration.
        
        :param side: "left" or "right"
        :param samples: List of sample dictionaries with gyro data
        :return: True if calibration should continue, False if complete
        """
        if not self.is_calibrating:
            return False
        
        calibrator = self.left_calibrator if side == "left" else self.right_calibrator
        if not calibrator:
            return False
        
        # Add all samples from the packet
        for sample in samples:
            gyro_values = {
                "gx": sample.get("gx", 0.0),
                "gy": sample.get("gy", 0.0),
                "gz": sample.get("gz", 0.0)
            }
            calibrator.add_sample(gyro_values)
        
        # Periodic status updates and convergence check
        current_time = time.time()
        if self.last_status_time is not None and current_time - self.last_status_time >= CALIBRATION_CHECK_INTERVAL:
            self._print_status()
            self.last_status_time = current_time
            
            if self.calibration_start_time is not None:
                elapsed = current_time - self.calibration_start_time
                
                # Check convergence after minimum duration
                if elapsed >= CALIBRATION_MIN_DURATION:
                    if self.left_calibrator is not None and self.right_calibrator is not None:
                        left_converged = self.left_calibrator.check_convergence()
                        right_converged = self.right_calibrator.check_convergence()
                        
                        if left_converged and right_converged:
                            print("Both wheels converged!", flush=True)
                            return False  # Stop calibration
                
                # Force stop at maximum duration
                if elapsed >= CALIBRATION_MAX_DURATION:
                    print("Maximum calibration time reached", flush=True)
                    return False  # Stop calibration
        
        return True  # Continue calibration
    
    def _print_status(self) -> None:
        """Print current calibration status."""
        if not (self.left_calibrator and self.right_calibrator):
            return
        
        elapsed = time.time() - (self.calibration_start_time or time.time())
        print(f"\nCalibration Status - Time: {elapsed:.1f}s", flush=True)
        
        left_stats = self.left_calibrator.get_stats()
        print(f"Left wheel:", flush=True)
        for axis in ["gx", "gy", "gz"]:
            stats = left_stats[axis]
            print(f"  {axis.upper()}: Offset: {stats['offset']:.4f} dps, "
                  f"Recent mean: {stats['recent_mean']:.4f} dps, "
                  f"Samples: {stats['samples']}", flush=True)
        
        right_stats = self.right_calibrator.get_stats()
        print(f"Right wheel:", flush=True)
        for axis in ["gx", "gy", "gz"]:
            stats = right_stats[axis]
            print(f"  {axis.upper()}: Offset: {stats['offset']:.4f} dps, "
                  f"Recent mean: {stats['recent_mean']:.4f} dps, "
                  f"Samples: {stats['samples']}", flush=True)
    
    def get_offsets(self) -> Dict[str, Dict[str, float]]:
        """
        Get current calibration offsets.
        
        :return: Dictionary with offsets for left and right wheels
        """
        if not (self.left_calibrator and self.right_calibrator):
            return {
                "left": {"gx": 0.0, "gy": 0.0, "gz": 0.0},
                "right": {"gx": 0.0, "gy": 0.0, "gz": 0.0}
            }
        
        return {
            "left": self.left_calibrator.current_offset.copy(),
            "right": self.right_calibrator.current_offset.copy()
        }
    
    def get_std_devs(self) -> Dict[str, Dict[str, float]]:
        """
        Get current standard deviations.
        
        :return: Dictionary with std devs for left and right wheels
        """
        if not (self.left_calibrator and self.right_calibrator):
            return {
                "left": {"gx": 0.0, "gy": 0.0, "gz": 0.0},
                "right": {"gx": 0.0, "gy": 0.0, "gz": 0.0}
            }
        
        return {
            "left": self.left_calibrator.current_std.copy(),
            "right": self.right_calibrator.current_std.copy()
        }


# Global calibration service instance
calibration_service = CalibrationService()
