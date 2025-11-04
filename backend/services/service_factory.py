"""
Dependency injection factory for creating service instances.
Centralizes configuration and dependency wiring.
"""
from services.kafka_service import KafkaMessageProducer, KafkaMessageConsumer
from services.message_processor import DataProcessor, DataLengthValidator
from services.message_handler import PacketMessageHandler, MessageProcessingPipeline
from utils.filtering import FFTLowPassFilter

class ServiceFactory:
    """
    Factory for creating configured service instances.
    Single Responsibility: Create and wire dependencies.
    """
    
    def __init__(
        self,
        kafka_bootstrap: str,
        raw_topic: str,
        result_topic: str,
        recording_events_topic: str,
        left_gain: float,
        right_gain: float,
        wheel_diameter: float,
        dist_wheels: float,
        cutoff_freq: float = 6.0
    ):
        """
        Initialize factory with configuration.
        
        :param kafka_bootstrap: Kafka bootstrap server address
        :param raw_topic: Topic to consume raw messages from
        :param result_topic: Topic to produce results to
        :param left_gain: Left wheel gain calibration
        :param right_gain: Right wheel gain calibration
        :param wheel_diameter: Wheel diameter in inches
        :param dist_wheels: Distance between wheels in inches
        :param cutoff_freq: FFT filter cutoff frequency in Hz
        """
        self._kafka_bootstrap = kafka_bootstrap
        self._raw_topic = raw_topic
        self._result_topic = result_topic
        self._recording_events_topic = recording_events_topic
        self._left_gain = left_gain
        self._right_gain = right_gain
        self._wheel_diameter = wheel_diameter
        self._dist_wheels = dist_wheels
        self._cutoff_freq = cutoff_freq
    
    def create_producer(self) -> KafkaMessageProducer:
        """Create a configured Kafka producer"""
        return KafkaMessageProducer(self._kafka_bootstrap)
    
    def create_consumer(self, group_id: str = "fastapi-smarthub") -> KafkaMessageConsumer:
        """Create a configured Kafka consumer"""
        return KafkaMessageConsumer(
            bootstrap_servers=self._kafka_bootstrap,
            topics=[self._raw_topic, self._recording_events_topic],
            group_id=group_id
        )
    
    def create_data_processor(self) -> DataProcessor:
        """Create a configured data processor with all dependencies"""
        validator = DataLengthValidator()
        signal_filter = FFTLowPassFilter(cutoff_freq=self._cutoff_freq)
        return DataProcessor(validator, signal_filter)
    
    def create_message_handler(self) -> PacketMessageHandler:
        """Create a configured message handler"""
        data_processor = self.create_data_processor()
        return PacketMessageHandler(
            data_processor=data_processor,
            left_gain=self._left_gain,
            right_gain=self._right_gain,
            diameter=self._wheel_diameter,
            dist_wheels=self._dist_wheels
        )
    
    def create_processing_pipeline(self, group_id: str = "fastapi-smarthub") -> MessageProcessingPipeline:
        """Create a fully configured processing pipeline"""
        consumer = self.create_consumer(group_id)
        producer = self.create_producer()
        handler = self.create_message_handler()
        
        return MessageProcessingPipeline(
            consumer=consumer,
            handler=handler,
            producer=producer,
            output_topic=self._result_topic
        )
