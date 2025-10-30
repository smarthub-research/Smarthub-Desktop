"""
Message handling and processing pipeline.
Separates concerns of consuming, processing, and producing messages.
"""
from abc import ABC, abstractmethod
from typing import List, Optional
import numpy as np

from services.kafka_service import IMessageConsumer, IMessageProducer
from services.message_processor import DataProcessor
from utils.decode_packet import convert_from_raw
import time

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
    
    async def handle_message(self, message: dict) -> Optional[dict]:
        """
        Process message - either packet data or recording events.
        For packet messages: mimics the dataService.js flow
        For recording events: handles start/stop/reset commands
        
        :param message: Message with keys depending on type
        :return: Processed results or None
        """
        # Check if this is a recording event or packet
        if message.get("type") == "recording_event":
            return await self._handle_recording_event(message=message)
        else:
            return await self._handle_packet(message=message)
        
    async def _handle_recording_event(self, message: dict) -> None:
        event_type = message.get("event")
        if event_type == "start-recording":
            print("Starting recording", flush=True)
            if self.start_time is not None:
                self.total_paused_time = time.time() - self.pause_start_time
            self.paused = False
        elif event_type == "restart-recording":
            print(f"Recording restarted - resetting session data", flush=True)
            self.reset_session()
            # start_time will be set on first packet
            self.paused_time = None
            self.paused = False
        elif event_type == "pause-recording":
            print(f"Recording paused", flush=True)
            self.paused = True
            self.pause_start_time = time.time()
        elif event_type == "end-test":
            print(f"Test ended - finalizing session", flush=True)
            # Could add logic here for saving final data
            await self._save_test_data()
        else:
            print(f"Unknown recording event: {event_type}", flush=True)
        # Recording events don't produce output messages
        return None
    
    async def _handle_packet(self, message: dict) -> Optional[dict]:
        # Skip processing if recording is paused
        if self.paused:
            return None
            
        # Initialize start time on first message
        if self.start_time is None:
            # Set start_time so that the first packet's newest timestamp is at current time
            self.start_time = time.time() - 3/68  # 3 intervals back to make oldest at 0
        
        # Extract byte array from message
        packet = message["packet"]

        # Decode the gyro data and accel data from bytearray
        raw_data = convert_from_raw(packet)
        
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
                        print(f"Filled gap with {num_fill_points} zero points", flush=True)
            
            self.time_stamps.extend(new_timestamps)
            
            # Accumulate gyro data from both sides
            self.gyro_left.extend(self.left_data["gyro_data"])
            self.gyro_right.extend(self.right_data["gyro_data"])
            self.accel_left.extend(self.left_data['accel_data'])
            self.accel_right.extend(self.right_data["accel_data"])
            
            # Process the ENTIRE accumulated data (not just the new packet)
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
            
            # Clear pending data for next packet pair
            self.left_data = None
            self.right_data = None

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
        self.test_id = 0
        print("Session reset - cleared all accumulated data", flush=True)
    
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

        # Convert numpy arrays to lists for database storage
        def convert_arrays(data):
            if isinstance(data, np.ndarray):
                return data.tolist()
            elif isinstance(data, dict):
                return {k: convert_arrays(v) for k, v in data.items()}
            elif isinstance(data, list):
                return [convert_arrays(item) for item in data]
            else:
                return data

        result = convert_arrays(result)

        self.test_file_id = await write_test(
            {
                "timeStamp": result["time_from_start"],
                "distance": result["dist_m"],
                "displacement": result["disp_m"],
                "velocity": result["velocity"],
                "heading": result["heading_deg"],
                "trajectory_x": result["trajectory"]["x"],
                "trajectory_y": result["trajectory"]["y"],
                "gyro_left": [x.tolist() if isinstance(x, np.ndarray) else x for x in self.gyro_left],
                "gyro_right": [x.tolist() if isinstance(x, np.ndarray) else x for x in self.gyro_right],
                'gyro_left_smoothed': result["gyro_left_smoothed"],
                'gyro_right_smoothed': result["gyro_right_smoothed"],
                "accel_right": [x.tolist() if isinstance(x, np.ndarray) else x for x in self.accel_right],
                "accel_left": [x.tolist() if isinstance(x, np.ndarray) else x for x in self.accel_left]
            }
        )
        # Update global current test ID
        global current_test_id
        current_test_id = self.test_file_id
        print("Test written")
        return None

    def get_test_id(self) -> int:
        return self.test_id


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
                # Process the message
                result = await self._handler.handle_message(message)
                
                # Only send if processing was successful
                if result:
                    await self._producer.send_message(self._output_topic, result)
        except Exception as e:
            print(f"Error in processing pipeline: {e}", flush=True)
            raise
