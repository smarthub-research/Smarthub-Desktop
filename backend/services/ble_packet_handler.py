"""
Unpackages packets and returns data to handler
"""
from packet_constants import PACKET_SIZE, SAMPLES_PER_PACKET, ACCEL_SCALE, GYRO_SCALE, COUNTER_MAX
import struct

class BLEPacketHandler:
    def __init__(self) -> None:
        # Global state variables
        self.counter_offsets = {"left": None, "right": None}
        self.last_norm_counters = {"left": None, "right": None}

        # Calibration data - axis-specific offsets and std devs
        self.gyro_offsets = {
            "left": {"gx": 0.0, "gy": 0.0, "gz": 0.0},
            "right": {"gx": 0.0, "gy": 0.0, "gz": 0.0}
        }
        self.gyro_std_devs = {
            "left": {"gx": 0.0, "gy": 0.0, "gz": 0.0}, 
            "right": {"gx": 0.0, "gy": 0.0, "gz": 0.0}
        }

    def unpack_packet(self, data):
        """
        data: 50-byte BLE packet with direct int16 encoding
        Returns: list of 4 samples, each sample = dict {ax, ay, az, gx, gy, gz}
        """
        if len(data) != PACKET_SIZE:
            raise ValueError(f"Invalid packet size: {len(data)}")

        # Packet counter (2 bytes little-endian)
        counter = struct.unpack_from("<H", data, 0)[0]

        samples = []
        for i in range(SAMPLES_PER_PACKET):
            # Calculate byte positions for each axis in this sample
            ax_pos = 2 + i * 2         # Bytes 2-9 (4 samples × 2 bytes)
            ay_pos = 2 + i * 2 + 8     # Bytes 10-17 
            az_pos = 2 + i * 2 + 16    # Bytes 18-25
            gx_pos = 2 + i * 2 + 24    # Bytes 26-33
            gy_pos = 2 + i * 2 + 32    # Bytes 34-41
            gz_pos = 2 + i * 2 + 40    # Bytes 42-49
            
            # Unpack int16 values (little-endian)
            ax_raw = struct.unpack_from("<h", data, ax_pos)[0]
            ay_raw = struct.unpack_from("<h", data, ay_pos)[0]
            az_raw = struct.unpack_from("<h", data, az_pos)[0]
            gx_raw = struct.unpack_from("<h", data, gx_pos)[0]
            gy_raw = struct.unpack_from("<h", data, gy_pos)[0]
            gz_raw = struct.unpack_from("<h", data, gz_pos)[0]
            
            # Apply scaling to convert to physical units
            sample = {
                "ax": ax_raw * ACCEL_SCALE,  # Convert to g
                "ay": ay_raw * ACCEL_SCALE,  # Convert to g  
                "az": az_raw * ACCEL_SCALE,  # Convert to g
                "gx": gx_raw * GYRO_SCALE,   # Convert to dps
                "gy": gy_raw * GYRO_SCALE,   # Convert to dps
                "gz": gz_raw * GYRO_SCALE    # Convert to dps
            }
            samples.append(sample)

        # print(samples, flush=True)
        return counter, samples

    def normalize_counter(self, side, raw_counter):
        """
        Normalize raw packet counter for a given side.
        First packet establishes the offset so that normalized starts at 1.
        Handles 16-bit rollover.
        """
        if self.counter_offsets[side] is None:
            self.counter_offsets[side] = raw_counter
        # Normalize relative to offset, wrapping around 16-bit max
        norm = (raw_counter - self.counter_offsets[side]) % COUNTER_MAX + 1
        return norm

    def check_increment(self, side, norm_counter):
        """
        For debugging: ensure packet counters increment by 1.
        Logs if packets were dropped.
        """
        last = self.last_norm_counters[side]
        if last is not None:
            expected = last + 1
            if norm_counter != expected:
                print(f"[WARN] {side} counter jump: expected {expected}, got {norm_counter}")
        self.last_norm_counters[side] = norm_counter
