"""
Message handling and processing pipeline.
Separates concerns of consuming, processing, and producing messages.
"""
from abc import ABC, abstractmethod
from typing import List, Optional
import numpy as np

from services.kafka_consumer import IMessageConsumer
from services.kafka_producer import IMessageProducer
from services.message_processor import DataProcessor
from services.ble_packet_handler import BLEPacketHandler
from services.calibration_service import calibration_service
import time
from packet_constants import KALMAN_BIAS_PROCESS_NOISE, KALMAN_PROCESS_NOISE, KALMAN_LEFT_R, KALMAN_RIGHT_R
from utils.filtering import BiasEstimatingKalmanFilter, process_gyro_kalman
from utils.downsampling import downsample_data

# Global variable to store the current test file ID
current_test_id = None

# Downsampling configuration
DOWNSAMPLE_WINDOW_SIZE = 12  # Number of points in each window to downsample
DOWNSAMPLE_TARGET_POINTS = 3  # Target number of points after downsampling each window

class IMessageHandler(ABC):
    """
    Interface for message handlers (Interface Segregation Principle).
    Allows different processing strategies.
    """
    
    @abstractmethod
    async def handle_message(self, message: dict) -> Optional[dict]:
        """
        Process a single message.
        
        :param message: Input message to process
        :return: Processed result or None if not ready
        """
        pass


class PacketMessageHandler(IMessageHandler):
    """
    Handles packet processing with sensor data.
    Single Responsibility: Process packet messages using DataProcessor.
    """
    
    def __init__(
        self,
        data_processor: DataProcessor,
        left_gain: float,
        right_gain: float,
        diameter: float,
        dist_wheels: float,
    ):
        """
        Initialize with processing configuration.
        
        :param data_processor: Data processor instance
        :param left_gain: Left wheel gain calibration
        :param right_gain: Right wheel gain calibration
        :param diameter: Wheel diameter in inches
        :param dist_wheels: Distance between wheels in inches
        :param threshold: Gyro threshold to filter out noise (default 0.03)
        """
        self._processor = data_processor
        self._left_gain = left_gain
        self._right_gain = right_gain
        self._diameter = diameter
        self._dist_wheels = dist_wheels
        
        # Initialize storage for pending data from both sides
        self.left_data = None
        self.right_data = None

        # Track recording start time for timestamp generation
        self.start_time: Optional[float] = None
        self.paused_time: Optional[float] = None
        
        # Track if recording is paused
        self.paused: bool = False
        
        # Track total paused time for timestamp adjustment
        self.total_paused_time: float = 0.0
        self.pause_start_time: float = 0.0
        self.time_stamps: List[float] = []
        
        # Initialize accel data storage as objects with ax, ay, az arrays
        self.accel_left = {"ax": [], "ay": [], "az": []}
        self.accel_right = {"ax": [], "ay": [], "az": []}
        
        # Initialize gyro data storage as objects with gx, gy, gz arrays
        self.gyro_left = {"gx": [], "gy": [], "gz": []}
        self.gyro_right = {"gx": [], "gy": [], "gz": []}
        
        # Buffer for accumulating calculated results before downsampling
        self.result_buffer = {
            "time_from_start": [],
            "dist_m": [],  # Use distance (cumulative) for downsampling and sending to frontend
            "velocity": [],
            "heading_deg": [],
            "trajectory_x": [],
            "trajectory_y": []
        }

        self.packet_handler = BLEPacketHandler()
        
        # Track if we should send messages to Kafka (stops when message gets too large)
        self.should_send_to_kafka: bool = True
        # Kafka message size limit (set to 800KB to be safe, actual limit is 1MB)
        # Conservative limit to account for overhead and prevent pipeline breaks
        self.max_kafka_message_size: int = 800 * 1024  # 800KB in bytes

        # Kalman filters - persistent across packets for each wheel and axis
        # Using bias-estimating filter to separate constant drift from true motion
        self.gyro_kalman = {
            "left": {
                "x": BiasEstimatingKalmanFilter(KALMAN_PROCESS_NOISE, KALMAN_BIAS_PROCESS_NOISE, KALMAN_LEFT_R[0]),
                "y": BiasEstimatingKalmanFilter(KALMAN_PROCESS_NOISE, KALMAN_BIAS_PROCESS_NOISE, KALMAN_LEFT_R[1]),
                "z": BiasEstimatingKalmanFilter(KALMAN_PROCESS_NOISE, KALMAN_BIAS_PROCESS_NOISE, KALMAN_LEFT_R[2]),
            },
            "right": {
                "x": BiasEstimatingKalmanFilter(KALMAN_PROCESS_NOISE, KALMAN_BIAS_PROCESS_NOISE, KALMAN_RIGHT_R[0]),
                "y": BiasEstimatingKalmanFilter(KALMAN_PROCESS_NOISE, KALMAN_BIAS_PROCESS_NOISE, KALMAN_RIGHT_R[1]),
                "z": BiasEstimatingKalmanFilter(KALMAN_PROCESS_NOISE, KALMAN_BIAS_PROCESS_NOISE, KALMAN_RIGHT_R[2]),
            }
        }
    
    async def handle_message(self, message: dict) -> Optional[dict]:
        """
        Process message - either packet data or recording events.
        For packet messages: mimics the dataService.js flow
        For recording events: handles start/stop/reset commands
        
        :param message: Message with keys depending on type
        :return: Processed results or None
        """
        # Check if this is a recording event or packet
        # print(f"Packet recieved: ", message)
        if message.get("type") == "recording_event":
            return await self._handle_recording_event(message=message)
        else:
            return await self._handle_packet(message=message)
        
    async def _handle_recording_event(self, message: dict) -> None:
        event_type = message.get("event")
        if event_type == "start-recording":
            if self.start_time is not None:
                self.total_paused_time = time.time() - self.pause_start_time
            self.paused = False
        elif event_type == "restart-recording":
            self.reset_session()
            self.paused_time = None
            self.paused = False
            # Reset calculation state in the processor
            self._processor.reset_calculations()
        elif event_type == "pause-recording":
            self.paused = True
            self.pause_start_time = time.time()
        elif event_type == "end-test":
            await self._save_test_data()
        elif event_type == "begin-static-calibration":
            print("Starting dynamic calibration...", flush=True)
            calibration_service.start_calibration()
        elif event_type == "end-static-calibration":
            print("Ending calibration manually...", flush=True)
            self._apply_calibration()
        else:
            print(f"Unknown recording event: {event_type}", flush=True)
        # Recording events don't produce output messages
        return None
    
    def _apply_calibration(self):
        results = calibration_service.stop_calibration()
        self.reset_session()
        self.paused_time = None
        self.paused = False
        # Reset calculation state in the processor
        self._processor.reset_calculations()
        # Apply calibration results to packet handler
        if results and 'offsets' in results and 'std_devs' in results:
            offsets = results['offsets']
            std_devs = results['std_devs']
            for side in ["left", "right"]:
                for axis in ["gx", "gy", "gz"]:
                    self.packet_handler.gyro_offsets[side][axis] = offsets[side][axis]
                    self.packet_handler.gyro_std_devs[side][axis] = std_devs[side][axis]
        return results
    
    async def _handle_packet(self, message: dict) -> Optional[dict]:
        """
        Main packet handling entry point. Delegates to specialized methods.
        
        :param message: Message containing packet data
        :return: Processed result or None
        """
        # Decode and validate packet
        raw_data = self._decode_packet(message)
        if raw_data is None:
            return None
        
        # Check if this is a calibration completion event
        if isinstance(raw_data, dict) and raw_data.get("type") == "calibration_complete":
            # Return calibration event immediately to send to Kafka
            return raw_data
        
        # Skip processing if recording is paused
        if self.paused:
            return None
        
        # Initialize timing on first packet
        self._initialize_start_time()
        
        # Store data by side
        self._store_packet_data(message["side"], raw_data)
        
        # Process when both sides are available
        if self._both_sides_ready():
            return await self._process_paired_packets(message)
        
        # Return None if waiting for the other side's data
        return None
    
    def _decode_packet(self, message: dict) -> Optional[dict]:
        """
        Decode packet bytes and extract sensor data.
        
        :param message: Message containing packet and metadata
        :return: Decoded raw data or None if decoding fails, 
                 or calibration event dict if calibration completes
        """
        packet = message["packet"]
        side = message.get("side", "unknown")
        
        try:
            # Convert packet to bytes
            packet_bytes = self._convert_to_bytes(packet)
            
            # Unpack packet data
            counter, samples = self.packet_handler.unpack_packet(packet_bytes)
            
            # Extract data for processing
            # Apply bias-estimating Kalman filtering to all gyro axes
            for sample in samples:
                # Process X-axis with bias-estimating Kalman
                gx_results = process_gyro_kalman(sample["gx"], self.gyro_kalman[side]["x"])
                sample["gx_raw"] = gx_results['raw']
                sample["gx_calibrated"] = gx_results['filtered']  # Bias-corrected velocity
                
                # Process Y-axis with bias-estimating Kalman
                gy_results = process_gyro_kalman(sample["gy"], self.gyro_kalman[side]["y"])
                sample["gy_raw"] = gy_results['raw']
                sample["gy_calibrated"] = gy_results['filtered']  # Bias-corrected velocity
                
                # Process Z-axis with bias-estimating Kalman
                gz_results = process_gyro_kalman(sample["gz"], self.gyro_kalman[side]["z"])
                sample["gz_raw"] = gz_results['raw']
                sample["gz_calibrated"] = gz_results['filtered']  # Bias-corrected velocity      

            gyro_data = [{
                "gx": sample["gx_calibrated"],
                "gy": sample["gy_calibrated"],
                "gz": sample["gz_calibrated"]
                } for sample in samples]
            accel_data = [{
                "ax": sample["ax"], 
                "ay": sample["ay"], 
                "az": sample["az"]
                } for sample in samples]
            
            return {
                "counter": counter,
                "gyro_data": gyro_data,
                "accel_data": accel_data
            }
        except Exception as e:
            print(f"Failed to unpack packet (len={len(packet) if packet is not None else 'None'}): {e}", flush=True)
            return None
    
    def _convert_to_bytes(self, packet) -> bytearray:
        """
        Convert packet data to bytearray format.
        
        :param packet: Packet data (list, bytes, or bytearray)
        :return: Packet as bytearray
        """
        if isinstance(packet, list):
            return bytearray(packet)
        elif isinstance(packet, bytearray):
            return packet
        elif isinstance(packet, bytes):
            return bytearray(packet)
        else:
            # Attempt to coerce other sequence types
            return bytearray(packet)
    
    def _initialize_start_time(self) -> None:
        """
        Initialize start time on first packet.
        Set start_time so that the first packet's newest timestamp is at current time.
        """
        if self.start_time is None:
            self.start_time = time.time() - 3/68  # 3 intervals back to make oldest at 0
    
    def _store_packet_data(self, side: str, raw_data: dict) -> None:
        """
        Store decoded packet data by side.
        
        :param side: "left" or "right"
        :param raw_data: Decoded packet data
        """
        if side == "left":
            self.left_data = raw_data
        else:
            self.right_data = raw_data
    
    def _both_sides_ready(self) -> bool:
        """
        Check if data from both sides is available for processing.
        
        :return: True if both left and right data are ready
        """
        return self.left_data is not None and self.right_data is not None
    
    async def _process_paired_packets(self, message: dict) -> Optional[dict]:
        """
        Process data when packets from both sides are available.
        
        :param message: Original message for metadata
        :return: Processed result or None
        """
        # Safety check - should not happen due to _both_sides_ready() check
        if self.left_data is None or self.right_data is None:
            return None
        
        # Generate timestamps
        new_timestamps = self._generate_time_stamps()
        
        # Fill any gaps in the data
        self._fill_data_gaps(new_timestamps)
        
        # Accumulate all data
        self._accumulate_data(new_timestamps)
        
        # Extract current packet data before clearing (only gy axis for processing)
        gyro_left = [sample["gy"] for sample in self.left_data["gyro_data"]]
        gyro_right = [sample["gy"] for sample in self.right_data["gyro_data"]]
        
        # Clear pending data for next packet pair
        self.left_data = None
        self.right_data = None
        
        # Check if we should skip Kafka transmission
        if not self.should_send_to_kafka:
            return None
        
        # Process and return result
        return self._process_and_enrich_result(
            gyro_left, gyro_right, new_timestamps, message
        )
    
    def _fill_data_gaps(self, new_timestamps: List[float]) -> None:
        """
        Fill gaps with zero data if resuming after a long pause.
        
        :param new_timestamps: New timestamps to check for gaps
        """
        if not self.time_stamps:
            return
        
        last_time = self.time_stamps[-1]
        first_new = new_timestamps[0]
        gap = first_new - last_time
        
        # Gap larger than 100ms indicates a long pause
        if gap > 0.1:
            num_fill_points = int(gap * 68) - 1  # -1 to avoid overlap
            if num_fill_points > 0:
                self._add_gap_fill_data(last_time, num_fill_points)
    
    def _add_gap_fill_data(self, last_time: float, num_points: int) -> None:
        """
        Add zero-filled data points to fill gaps.
        
        :param last_time: Last recorded timestamp
        :param num_points: Number of points to fill
        """
        fill_timestamps = []
        
        for i in range(num_points):
            fill_timestamps.append(last_time + (i+1) * (1/68))
            # Fill zeros for all three axes
            self.gyro_left["gx"].append(0.0)
            self.gyro_left["gy"].append(0.0)
            self.gyro_left["gz"].append(0.0)
            self.gyro_right["gx"].append(0.0)
            self.gyro_right["gy"].append(0.0)
            self.gyro_right["gz"].append(0.0)
        
        self.time_stamps.extend(fill_timestamps)
    
    def _accumulate_data(self, new_timestamps: List[float]) -> None:
        """
        Accumulate gyro and accel data from both sides.
        
        :param new_timestamps: Timestamps for new data
        """
        # Safety check - should not happen due to earlier checks
        if self.left_data is None or self.right_data is None:
            return
        
        self.time_stamps.extend(new_timestamps)
        
        # Extract and accumulate gyro data by axis
        for sample in self.left_data["gyro_data"]:
            self.gyro_left["gx"].append(sample["gx"])
            self.gyro_left["gy"].append(sample["gy"])
            self.gyro_left["gz"].append(sample["gz"])
        
        for sample in self.right_data["gyro_data"]:
            self.gyro_right["gx"].append(sample["gx"])
            self.gyro_right["gy"].append(sample["gy"])
            self.gyro_right["gz"].append(sample["gz"])
        
        # Extract and accumulate accel data by axis
        for sample in self.left_data['accel_data']:
            self.accel_left["ax"].append(sample["ax"])
            self.accel_left["ay"].append(sample["ay"])
            self.accel_left["az"].append(sample["az"])
        
        for sample in self.right_data["accel_data"]:
            self.accel_right["ax"].append(sample["ax"])
            self.accel_right["ay"].append(sample["ay"])
            self.accel_right["az"].append(sample["az"])
    
    def _process_and_enrich_result(
        self,
        gyro_left: List[float],
        gyro_right: List[float],
        time_stamps: List[float],
        message: dict
    ) -> Optional[dict]:
        """
        Process data and add metadata to result.
        
        :param gyro_left: Left gyro data
        :param gyro_right: Right gyro data
        :param time_stamps: Timestamps
        :param message: Original message for metadata
        :return: Enriched result or None
        """
        result = self._processor.process_data(
            {
                "gyro_left": gyro_left,
                "gyro_right": gyro_right,
                "time_from_start": time_stamps
            },
            self._left_gain,
            self._right_gain,
            self._diameter,
            self._dist_wheels
        )
        
        # Only process if result is a dict
        if result and isinstance(result, dict):
            result['device_id'] = message.get('device_id')
            result['timestamp'] = message.get('ts')
            # Convert and ensure we still have a dict
            converted = self._convert_to_json_serializable(result)
            if isinstance(converted, dict):
                # Accumulate results in buffer
                return self._accumulate_and_downsample_result(converted, message)
        
        return None
    
    def _accumulate_and_downsample_result(self, result: dict, message: dict) -> Optional[dict]:
        """
        Accumulate results and downsample when we have enough data.
        Only sends to frontend when buffer reaches DOWNSAMPLE_WINDOW_SIZE points.
        
        :param result: New result data to accumulate
        :param message: Original message for metadata
        :return: Downsampled result if buffer is full, None otherwise
        """
        # Extract trajectory data
        trajectory = result.get("trajectory", {})
        
        # Accumulate new data into buffer
        self.result_buffer["time_from_start"].extend(result.get("time_from_start", []))
        self.result_buffer["dist_m"].extend(result.get("dist_m", []))
        self.result_buffer["velocity"].extend(result.get("velocity", []))
        self.result_buffer["heading_deg"].extend(result.get("heading_deg", []))
        
        # Handle trajectory data - ensure we add the same number of points
        num_points = len(result.get("time_from_start", []))
        if isinstance(trajectory, dict):
            traj_x = trajectory.get("x", [])
            traj_y = trajectory.get("y", [])
            # Pad with zeros if trajectory is shorter than other data
            if len(traj_x) < num_points:
                traj_x = traj_x + [0.0] * (num_points - len(traj_x))
            if len(traj_y) < num_points:
                traj_y = traj_y + [0.0] * (num_points - len(traj_y))
            self.result_buffer["trajectory_x"].extend(traj_x[:num_points])
            self.result_buffer["trajectory_y"].extend(traj_y[:num_points])
        else:
            # No trajectory data, pad with zeros
            self.result_buffer["trajectory_x"].extend([0.0] * num_points)
            self.result_buffer["trajectory_y"].extend([0.0] * num_points)
        
        # Check if we have enough data to downsample
        buffer_length = len(self.result_buffer["time_from_start"])
        if buffer_length < DOWNSAMPLE_WINDOW_SIZE:
            # Not enough data yet, don't send anything
            return None
        
        # Verify all arrays have consistent lengths before downsampling
        min_length = min(
            len(self.result_buffer["time_from_start"]),
            len(self.result_buffer["dist_m"]),
            len(self.result_buffer["velocity"]),
            len(self.result_buffer["heading_deg"]),
            len(self.result_buffer["trajectory_x"]),
            len(self.result_buffer["trajectory_y"])
        )
        
        if min_length < DOWNSAMPLE_WINDOW_SIZE:
            # Arrays have inconsistent lengths, skip this cycle
            return None
        
        # We have enough data, downsample and send
        # Use exact DOWNSAMPLE_WINDOW_SIZE to ensure all arrays are same length
        window_buffer = {
            "timeStamp": self.result_buffer["time_from_start"][:DOWNSAMPLE_WINDOW_SIZE],
            "distance": self.result_buffer["dist_m"][:DOWNSAMPLE_WINDOW_SIZE],  # Use distance for LTTB
            "velocity": self.result_buffer["velocity"][:DOWNSAMPLE_WINDOW_SIZE],
            "heading": self.result_buffer["heading_deg"][:DOWNSAMPLE_WINDOW_SIZE],
            "trajectory_x": self.result_buffer["trajectory_x"][:DOWNSAMPLE_WINDOW_SIZE],
            "trajectory_y": self.result_buffer["trajectory_y"][:DOWNSAMPLE_WINDOW_SIZE]
        }
        
        # Downsample the window
        downsampled_points = downsample_data(window_buffer, DOWNSAMPLE_TARGET_POINTS)
        
        # Check if downsampling succeeded
        if not downsampled_points:
            # Downsampling failed, skip this cycle but still clear buffer to avoid infinite loop
            for key in self.result_buffer:
                self.result_buffer[key] = self.result_buffer[key][DOWNSAMPLE_WINDOW_SIZE:]
            return None
        
        # Clear the processed data from buffer (keep remainder)
        for key in self.result_buffer:
            self.result_buffer[key] = self.result_buffer[key][DOWNSAMPLE_WINDOW_SIZE:]
        
        # Reconstruct result dictionary with downsampled data
        downsampled_result = {
            "time_from_start": [p["timeStamp"] for p in downsampled_points],
            "dist_m": [p["distance"] for p in downsampled_points],
            "velocity": [p["velocity"] for p in downsampled_points],
            "heading_deg": [p["heading"] for p in downsampled_points],
            "trajectory": {
                "x": [p["trajectory_x"] for p in downsampled_points],
                "y": [p["trajectory_y"] for p in downsampled_points]
            },
            "device_id": message.get("device_id"),
            "timestamp": message.get("ts")
        }
        
        return downsampled_result
    
    def reset_session(self):
        """
        Reset accumulated data for a new recording session.
        Should be called when starting a new recording.
        """
        global current_test_id
        current_test_id = None
        self.gyro_left = {"gx": [], "gy": [], "gz": []}
        self.gyro_right = {"gx": [], "gy": [], "gz": []}
        self.accel_left = {"ax": [], "ay": [], "az": []}
        self.accel_right = {"ax": [], "ay": [], "az": []}
        self.time_stamps = []
        self.result_buffer = {
            "time_from_start": [],
            "dist_m": [],
            "velocity": [],
            "heading_deg": [],
            "trajectory_x": [],
            "trajectory_y": []
        }
        self.left_data = None
        self.right_data = None
        self.start_time = None
        self.paused = False
        self.total_paused_time = 0.0
        self.test_file_id = None
        self.should_send_to_kafka = True
        # Reset calculation state in the processor
        self._processor.reset_calculations()
        print("Session reset - cleared all accumulated data and calculation state", flush=True)
    
    def _convert_to_json_serializable(self, data):
        """
        Convert numpy arrays and other non-JSON-serializable types to JSON-compatible types.
        Recursively handles nested structures.
        
        :param data: Data potentially containing numpy arrays
        :return: Data with all values converted to JSON-serializable types
        """
        if isinstance(data, np.ndarray):
            return data.tolist()
        elif isinstance(data, (np.integer, np.floating)):
            return data.item()
        elif isinstance(data, list):
            return [self._convert_to_json_serializable(item) for item in data]
        elif isinstance(data, dict):
            return {key: self._convert_to_json_serializable(value) for key, value in data.items()}
        else:
            return data
    
    def _generate_time_stamps(self) -> List[float]:
        """
        Generate timestamps for the 4 data points in the packet.
        Mimics dataService.js timestamp generation in processPackets.
        Generates timestamps from oldest to newest at 68Hz sensor rate.
        Adjusts for total paused time to keep timestamps continuous.
        
        :return: List of 4 timestamps
        """
        if self.start_time is None:
            self.start_time = time.time()
        
        time_curr = (time.time() - self.start_time) - self.total_paused_time
        # Generate timestamps for the 4 data points (oldest to newest)
        time_vals = []
        for i in range(3, -1, -1):
            time_vals.append(time_curr - i * (1/68))
        return time_vals
    
    async def _save_test_data(self) -> None:
        from routers.db import write_test
        import json
        import os
        from datetime import datetime
        
        # Process the accumulated data to get calculated results
        # Pass only gy axis data to processor (for backward compatibility)
        result = self._processor.process_data(
            {
                "gyro_left": self.gyro_left["gy"],
                "gyro_right": self.gyro_right["gy"],
                "time_from_start": self.time_stamps
            },
            self._left_gain,
            self._right_gain,
            self._diameter,
            self._dist_wheels
        )

        # Convert numpy arrays to lists for JSON serialization
        def convert_arrays(data):
            if isinstance(data, np.ndarray):
                return data.tolist()
            elif isinstance(data, dict):
                return {k: convert_arrays(v) for k, v in data.items()}
            elif isinstance(data, list):
                return [convert_arrays(item) for item in data]
            else:
                return data

        # Convert all result data to JSON-serializable format
        result_converted = convert_arrays(result) if result else {}
        
        # Convert raw sensor data (keep all axes for JSON file storage)
        gyro_left_list = convert_arrays(self.gyro_left)
        gyro_right_list = convert_arrays(self.gyro_right)
        accel_left_list = convert_arrays(self.accel_left)
        accel_right_list = convert_arrays(self.accel_right)
        
        # For database write, extract only primary axes (gy for gyro, ay for accel)
        gyro_left_for_db = self.gyro_left["gy"]  # Using Y-axis as primary for gyro
        gyro_right_for_db = self.gyro_right["gy"]
        accel_left_for_db = self.accel_left["ay"]  # Using Y-axis as primary for accel
        accel_right_for_db = self.accel_right["ay"]
        
        # Prepare comprehensive data structure with both raw and calculated data
        comprehensive_data = {
            # Metadata
            "test_timestamp": datetime.now().isoformat(),
            "calibration": {
                "left_gain": self._left_gain,
                "right_gain": self._right_gain,
                "wheel_diameter": self._diameter,
                "wheel_distance": self._dist_wheels
            },
            # Raw sensor data
            "raw_data": {
                "timestamps": self.time_stamps,
                "gyro_left": gyro_left_list,
                "gyro_right": gyro_right_list,
                "accel_left": accel_left_list,
                "accel_right": accel_right_list
            },
            # Calculated/processed data from processor
            "calculated_data": result_converted
        }
        
        # Save to JSON file
        os.makedirs("data", exist_ok=True)
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        data_file = os.path.join("data", f"test_data_{timestamp}.json")
        
        with open(data_file, "w") as f:
            json.dump(comprehensive_data, f, indent=2)
        
        print(f"Saved comprehensive test data to {data_file}", flush=True)

        # Write to database (using type-safe dict access)
        trajectory = result_converted.get("trajectory", {}) if isinstance(result_converted, dict) else {}
        
        self.test_file_id = await write_test(
            {
                "timeStamp": result_converted.get("time_from_start", self.time_stamps) if isinstance(result_converted, dict) else self.time_stamps,
                "distance": result_converted.get("dist_m", []) if isinstance(result_converted, dict) else [],
                "displacement": result_converted.get("disp_m", []) if isinstance(result_converted, dict) else [],
                "velocity": result_converted.get("velocity", []) if isinstance(result_converted, dict) else [],
                "heading": result_converted.get("heading_deg", []) if isinstance(result_converted, dict) else [],
                "trajectory_x": trajectory.get("x", []) if isinstance(trajectory, dict) else [],
                "trajectory_y": trajectory.get("y", []) if isinstance(trajectory, dict) else [],
                "gyro_left": gyro_left_for_db,
                "gyro_right": gyro_right_for_db,
                'gyro_left_smoothed': result_converted.get("gyro_left_smoothed", []) if isinstance(result_converted, dict) else [],
                'gyro_right_smoothed': result_converted.get("gyro_right_smoothed", []) if isinstance(result_converted, dict) else [],
                "accel_right": accel_right_for_db,
                "accel_left": accel_left_for_db
            }
        )
        # Update global current test ID
        global current_test_id
        current_test_id = self.test_file_id
        print(f"Test written with file_id: {self.test_file_id}", flush=True)
        return None

    def get_test_file_id(self) -> Optional[int]:
        """Get the current test file ID"""
        return self.test_file_id


class MessageProcessingPipeline:
    """
    Orchestrates the message processing pipeline.
    Single Responsibility: Coordinate consumer -> handler -> producer flow.
    Open/Closed: Can add new handlers without modifying this class.
    """
    
    def __init__(
        self,
        consumer: IMessageConsumer,
        handler: IMessageHandler,
        producer: IMessageProducer,
        output_topic: str
    ):
        """
        Initialize processing pipeline.
        
        :param consumer: Message consumer
        :param handler: Message handler
        :param producer: Message producer
        :param output_topic: Topic to send processed results
        """
        self._consumer = consumer
        self._handler = handler
        self._producer = producer
        self._output_topic = output_topic
        self._running = False
    
    async def start(self) -> None:
        """Start the pipeline components"""
        await self._consumer.start()
        await self._producer.start()
        self._running = True
    
    async def stop(self) -> None:
        """Stop the pipeline components"""
        self._running = False
        await self._consumer.stop()
        await self._producer.stop()
    
    async def process_messages(self) -> None:
        """
        Main processing loop.
        Consumes messages, processes them, and produces results.
        """
        if not self._running:
            raise RuntimeError("Pipeline not started. Call start() first.")
        
        try:
            async for message in self._consumer.consume_messages():
                try:
                    # Process the message
                    result = await self._handler.handle_message(message)
                    
                    # Only send if processing was successful
                    if result:
                        await self._producer.send_message(self._output_topic, result)
                except Exception as e:
                    # Check if this is a Kafka message size error
                    if "MessageSizeTooLarge" in str(e):
                        print(f"[WARNING] Kafka message too large, skipping send. Error: {e}", flush=True)
                        print("Data will still be saved to database at end of test.", flush=True)
                        # Don't break the pipeline, just continue processing
                        continue
                    else:
                        # For other errors, log but continue processing
                        print(f"[ERROR] Error processing message: {e}", flush=True)
                        import traceback
                        traceback.print_exc()
                        # Continue processing other messages
                        continue
        except Exception as e:
            print(f"[FATAL] Error in processing pipeline: {e}", flush=True)
            raise
