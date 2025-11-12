"""
Message handling and processing pipeline.
Separates concerns of consuming, processing, and producing messages.
"""
from abc import ABC, abstractmethod
from typing import List, Optional
import numpy as np
from utils.save_to_json import save_data

from services.kafka_service import IMessageConsumer, IMessageProducer
from services.message_processor import DataProcessor
from services.ble_packet_handler import BLEPacketHandler
from services.calibration_service import calibration_service
import time
from utils.gyro_offsets import process_gyro_axis

# Global variable to store the current test file ID
current_test_id = None

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
        
        # Accumulate all gyro data and timestamps for entire session
        self.gyro_left: List[float] = []
        self.gyro_right: List[float] = []
        self.accel_left: List[float] = []
        self.accel_right: List[float] = []
        self.time_stamps: List[float] = []

        self.packet_handler = BLEPacketHandler()
        
        # Track if we should send messages to Kafka (stops when message gets too large)
        self.should_send_to_kafka: bool = True
        # Kafka message size limit (set to 800KB to be safe, actual limit is 1MB)
        # Conservative limit to account for overhead and prevent pipeline breaks
        self.max_kafka_message_size: int = 800 * 1024  # 800KB in bytes
    
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
            results = calibration_service.stop_calibration()
            # Apply calibration results to packet handler
            if results and 'offsets' in results and 'std_devs' in results:
                offsets = results['offsets']
                std_devs = results['std_devs']
                for side in ["left", "right"]:
                    for axis in ["gx", "gy", "gz"]:
                        self.packet_handler.gyro_offsets[side][axis] = offsets[side][axis]
                        self.packet_handler.gyro_std_devs[side][axis] = std_devs[side][axis]
        else:
            print(f"Unknown recording event: {event_type}", flush=True)
        # Recording events don't produce output messages
        return None
    
    def _apply_offsets(self, samples, side):
        # If calibration is active, process samples for calibration
        if calibration_service.is_calibrating:
            should_continue = calibration_service.process_packet(side, samples)
            if not should_continue:
                # Calibration complete, stop it
                results = calibration_service.stop_calibration()
                # Apply calibration results
                if results and 'offsets' in results and 'std_devs' in results:
                    offsets = results['offsets']
                    std_devs = results['std_devs']
                    print(f"\n[APPLYING OFFSETS] Left: {offsets['left']}", flush=True)
                    print(f"[APPLYING OFFSETS] Right: {offsets['right']}", flush=True)
                    for wheel_side in ["left", "right"]:
                        for axis in ["gx", "gy", "gz"]:
                            self.packet_handler.gyro_offsets[wheel_side][axis] = offsets[wheel_side][axis]
                            self.packet_handler.gyro_std_devs[wheel_side][axis] = std_devs[wheel_side][axis]
                    print(f"[APPLIED] packet_handler offsets - Left: {self.packet_handler.gyro_offsets['left']}", flush=True)
                    print(f"[APPLIED] packet_handler offsets - Right: {self.packet_handler.gyro_offsets['right']}", flush=True)
                    print("Calibration complete and applied!", flush=True)
                    # Reset debug flags so we see the new offsets on next packet
                    if hasattr(self, '_offset_debug_printed'):
                        self._offset_debug_printed = {}
                
                # Send calibration completion event to frontend via result topic
                # This will notify the frontend to stop reading data
                return {
                    "type": "calibration_complete",
                    "results": results,
                    "timestamp": time.time()
                }
            return None  # Don't process packets during calibration
        
    def _calibrate_gyros(self, samples, side):
        for idx, sample in enumerate(samples):
            # Store original value for debug
            original_gy = sample["gy"] if idx == 0 else None
            
            # Process all gyro axes with axis-specific offsets
            gx_results = process_gyro_axis(
                sample["gx"], 
                self.packet_handler.gyro_offsets[side]["gx"], 
                self.packet_handler.gyro_std_devs[side]["gx"]
            )
            sample["gx_raw"] = gx_results['raw']
            sample["gx"] = gx_results['calibrated']  # Update with calibrated value
            
            gy_results = process_gyro_axis(
                sample["gy"], 
                self.packet_handler.gyro_offsets[side]["gy"], 
                self.packet_handler.gyro_std_devs[side]["gy"]
            )
            sample["gy_raw"] = gy_results['raw']
            sample["gy"] = gy_results['calibrated']  # Update with calibrated value
            
            # Debug first sample
            if original_gy is not None and idx == 0:
                print(f"[DEBUG {side}] Sample gy: raw={original_gy:.6f} -> calibrated={sample['gy']:.6f} (offset={self.packet_handler.gyro_offsets[side]['gy']:.6f})", flush=True)
                self._sample_debug_shown = True
            
            gz_results = process_gyro_axis(
                sample["gz"], 
                self.packet_handler.gyro_offsets[side]["gz"], 
                self.packet_handler.gyro_std_devs[side]["gz"]
            )
            sample["gz_raw"] = gz_results['raw']
            sample["gz"] = gz_results['calibrated']  # Update with calibrated value
        return samples
    
    async def _handle_packet(self, message: dict) -> Optional[dict]:
        # Extract byte array from message
        packet = message["packet"]
        side = message.get("side", "unknown")

        # Decode the gyro data and accel data from bytearray
        # Some producers may send the packet as a list of ints (JSON). Convert to bytes-like if necessary.
        try:
            if isinstance(packet, list):
                packet_bytes = bytearray(packet)
            elif isinstance(packet, (bytes, bytearray)):
                packet_bytes = packet
            else:
                # Attempt to coerce other sequence types
                packet_bytes = bytearray(packet)

            counter, samples = self.packet_handler.unpack_packet(packet_bytes)
            self._apply_offsets(samples=samples, side=side)
            
            # Skip processing if recording is paused
            if self.paused:
                return None
                
            # Initialize start time on first message
            if self.start_time is None:
                # Set start_time so that the first packet's newest timestamp is at current time
                self.start_time = time.time() - 3/68  # 3 intervals back to make oldest at 0
            
            # Transform samples into the format expected by the processor
            # samples is a list of dicts: [{"ax": ..., "ay": ..., "az": ..., "gx": ..., "gy": ..., "gz": ...}, ...]
            # Apply calibration offsets to all gyro axes
            
            samples = self._calibrate_gyros(samples=samples, side=side)
            
            # Extract calibrated gyro data (gy axis) for wheel rotation
            gyro_data = [sample["gy"] for sample in samples]
            accel_data = [[sample["ax"], sample["ay"], sample["az"]] for sample in samples]
            
            raw_data = {
                "counter": counter,
                "gyro_data": gyro_data,
                "accel_data": accel_data
            }
        except Exception as e:
            print(f"Failed to unpack packet (len={len(packet) if packet is not None else 'None'}): {e}", flush=True)
            return None
        
        # Store decoded data by side (like dataService.js stores pendingLeftData/pendingRightData)
        if message["side"] == "left":
            self.left_data = raw_data
        else:
            self.right_data = raw_data
        
        # If we have stored data for both sides, then we can perform calculations
        if self.left_data is not None and self.right_data is not None:
            # Generate timestamps (like dataService.js does in processPackets)
            new_timestamps = self._generate_time_stamps()
            
            # Fill gaps with zero data if resuming after a long pause
            if self.time_stamps:
                last_time = self.time_stamps[-1]
                first_new = new_timestamps[0]
                gap = first_new - last_time
                if gap > 0.1:  # Gap larger than 100ms (long pause)
                    # Calculate how many points to fill (at 68Hz)
                    num_fill_points = int(gap * 68) - 1  # -1 to avoid overlap
                    if num_fill_points > 0:
                        fill_timestamps = []
                        fill_gyro_left = []
                        fill_gyro_right = []
                        for i in range(num_fill_points):
                            fill_timestamps.append(last_time + (i+1) * (1/68))
                            fill_gyro_left.append(0.0)
                            fill_gyro_right.append(0.0)
                        self.time_stamps.extend(fill_timestamps)
                        self.gyro_left.extend(fill_gyro_left)
                        self.gyro_right.extend(fill_gyro_right)
                        # print(f"Filled gap with {num_fill_points} zero points", flush=True)
            
            self.time_stamps.extend(new_timestamps)
            
            # Accumulate gyro data from both sides
            self.gyro_left.extend(self.left_data["gyro_data"])
            self.gyro_right.extend(self.right_data["gyro_data"])
            self.accel_left.extend(self.left_data['accel_data'])
            self.accel_right.extend(self.right_data["accel_data"])

            # Send only one packets worth of data
            gyro_left = self.left_data["gyro_data"]
            gyro_right = self.right_data["gyro_data"]
            time_stamps = new_timestamps
            
            # Clear pending data for next packet pair
            self.left_data = None
            self.right_data = None
            
            # Check if we should skip Kafka transmission to avoid processing large datasets
            if not self.should_send_to_kafka:
                # Still process for database but don't send to Kafka
                return None
            
            # Process a single packet
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

            # Add metadata if processing was successful
            if result:
                result['device_id'] = message.get('device_id')
                result['timestamp'] = message.get('ts')
                
                # Convert numpy arrays to lists for JSON serialization
                result = self._convert_to_json_serializable(result)
                
                return result
        
        # Return None if waiting for the other side's data
        return None
    
    def reset_session(self):
        """
        Reset accumulated data for a new recording session.
        Should be called when starting a new recording.
        """
        global current_test_id
        current_test_id = None
        self.gyro_left = []
        self.gyro_right = []
        self.accel_left = []
        self.accel_right = []
        self.time_stamps = []
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
        result = self._processor.process_data(
            {
                "gyro_left": self.gyro_left,
                "gyro_right": self.gyro_right,
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
        
        # Convert raw sensor data
        gyro_left_list = convert_arrays(self.gyro_left)
        gyro_right_list = convert_arrays(self.gyro_right)
        accel_left_list = convert_arrays(self.accel_left)
        accel_right_list = convert_arrays(self.accel_right)
        
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
                "gyro_left": gyro_left_list,
                "gyro_right": gyro_right_list,
                'gyro_left_smoothed': result_converted.get("gyro_left_smoothed", []) if isinstance(result_converted, dict) else [],
                'gyro_right_smoothed': result_converted.get("gyro_right_smoothed", []) if isinstance(result_converted, dict) else [],
                "accel_right": accel_right_list,
                "accel_left": accel_left_list
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
