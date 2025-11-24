"""
Configuration constants for SmartHub Test
"""

# BLE Configuration
IMU_CHAR_UUID = "70ef18c1-2a2e-4767-b533-1d588f52dfd8"

# Data Configuration
DATA_FOLDER = "data"
LOG_INTERVAL = 1.0

# Packet Configuration
SAMPLE_DT = 1.0 / 104.0        # ~9.6 ms between samples (104 Hz effective data rate)
PACKET_SIZE = 50
AXES = ["ax", "ay", "az", "gx", "gy", "gz"]
SAMPLES_PER_PACKET = 4

# Scaling Configuration
# LSM6DS3 with ±4g range: 0.000122 g/LSB
ACCEL_RANGE = 4  # g
ACCEL_SCALE = 0.061 * (ACCEL_RANGE >> 1)/1000  # Convert int16 to g
# LSM6DS3 with ±500 dps range: 0.0175 dps/LSB  
GYRO_RANGE = 500  # degrees per second
GYRO_RANGE_DIVISOR = GYRO_RANGE/125
GYRO_SCALE = 4.375 * GYRO_RANGE_DIVISOR/1000  # Convert int16 to dps

# Counter Configuration
COUNTER_MAX = 65536    # wraps at 2^16

# Calibration Configuration
CALIBRATION_TARGET_ACCURACY = 0.01   # Target accuracy in dps (stop when drift < this)
CALIBRATION_MIN_DURATION = 10        # Minimum calibration time in seconds
CALIBRATION_MAX_DURATION = 120       # Maximum calibration time in seconds
CALIBRATION_STABILITY_WINDOW = 50    # Samples to check for stability
CALIBRATION_CHECK_INTERVAL = 2       # Check accuracy every N seconds

# Processing Configuration
NOISE_THRESHOLD_SIGMAS = 2  # Number of std devs to consider as noise (2 sigma zeroing)
SAMPLE_RATE = 104.0           # Sample rate in Hz (26Hz packets × 4 samples = 104Hz effective)

# Deadzone Filtering Configuration
GYRO_DEAD_ZONE = 3.0          # Dead zone threshold in deg/s for low-speed noise
GYRO_HYSTERESIS = 0.5         # Hysteresis to prevent oscillation around dead zone

# Kalman Filter Configuration
# Process noise (Q) - how much the true rate can change between samples
KALMAN_PROCESS_NOISE = 0.0001  # For velocity state
KALMAN_BIAS_PROCESS_NOISE = 1e-6  # For bias state (very small - bias changes slowly)

# Measurement noise variances (R) from 15-second stationary run
# Format: (X, Y, Z) axis variances
KALMAN_LEFT_R = (8.1171e-04, 0.0011, 9.3547e-04)
KALMAN_RIGHT_R = (0.0018, 0.0035, 0.0012)