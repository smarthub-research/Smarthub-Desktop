"""
Message handling and processing pipeline.
Separates concerns of consuming, processing, and producing messages.
"""
from abc import ABC, abstractmethod
from typing import Dict, List, Optional
import numpy as np

from services.kafka_service import IMessageConsumer, IMessageProducer
from services.message_processor import DataProcessor
from utils.decode_packet import convert_from_raw
import time


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
        
        # Accumulate all gyro data and timestamps for entire session
        self.gyro_left: List[float] = []
        self.gyro_right: List[float] = []
        self.time_stamps: List[float] = []
    
    async def handle_message(self, message: dict) -> Optional[dict]:
        """
        Process packet message with sensor data.
        Mimics the dataService.js flow:
        1. Decode raw packet
        2. Store by side (left/right)
        3. Wait for both sides
        4. Generate timestamps
        5. Apply threshold
        6. Process (smooth + calculate)
        
        :param message: Raw packet data with keys: 'packet', 'side', 'device_id', 'ts'
        :return: Processed results or None if waiting for other side
        """
        # Initialize start time on first message
        if self.start_time is None:
            self.start_time = time.time()
        
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
            self.time_stamps.extend(new_timestamps)
            
            # Accumulate gyro data from both sides
            self.gyro_left.extend(self.left_data["gyro_data"])
            self.gyro_right.extend(self.right_data["gyro_data"])
            
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
        self.gyro_left = []
        self.gyro_right = []
        self.time_stamps = []
        self.left_data = None
        self.right_data = None
        self.start_time = None
        print("Session reset - cleared all accumulated data")
    
    def _convert_to_json_serializable(self, data: dict) -> dict:
        """
        Convert numpy arrays and other non-JSON-serializable types to JSON-compatible types.
        
        :param data: Dictionary potentially containing numpy arrays
        :return: Dictionary with all values converted to JSON-serializable types
        """
        result = {}
        for key, value in data.items():
            if isinstance(value, np.ndarray):
                result[key] = value.tolist()
            elif isinstance(value, (np.integer, np.floating)):
                result[key] = value.item()
            elif isinstance(value, list):
                # Handle list of numpy types
                result[key] = [
                    v.item() if isinstance(v, (np.integer, np.floating)) 
                    else v.tolist() if isinstance(v, np.ndarray)
                    else v
                    for v in value
                ]
            else:
                result[key] = value
        return result
    
    def _generate_time_stamps(self) -> List[float]:
        """
        Generate timestamps for the 4 data points in the packet.
        Mimics dataService.js timestamp generation in processPackets.
        Generates timestamps from oldest to newest at 68Hz sensor rate.
        
        :return: List of 4 timestamps
        """
        if self.start_time is None:
            self.start_time = time.time()
        
        time_curr = time.time() - self.start_time
        # Generate timestamps for the 4 data points (oldest to newest)
        time_vals = []
        for i in range(3, -1, -1):
            time_vals.append(time_curr - i * (1/68))
        return time_vals


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
            print(f"Error in processing pipeline: {e}")
            raise
