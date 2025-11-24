from typing import Optional
import json
from services.message_producer import IMessageProducer

from aiokafka import AIOKafkaProducer

class KafkaMessageProducer(IMessageProducer):
    """
    Kafka implementation of message producer.
    Single Responsibility: Only handles Kafka message production.
    """
    
    def __init__(self, bootstrap_servers: str):
        """
        Initialize producer with configuration.
        
        :param bootstrap_servers: Kafka bootstrap server address
        """
        self._bootstrap_servers = bootstrap_servers
        self._producer: Optional[AIOKafkaProducer] = None
    
    async def start(self) -> None:
        """Start the Kafka producer"""
        if self._producer is None:
            self._producer = AIOKafkaProducer(
                bootstrap_servers=self._bootstrap_servers
            )
            await self._producer.start()
    
    async def stop(self) -> None:
        """Stop the Kafka producer"""
        if self._producer:
            await self._producer.stop()
            self._producer = None
    
    async def send_message(self, topic: str, message: dict) -> None:
        """
        Send a JSON message to a Kafka topic.
        
        :param topic: Target Kafka topic
        :param message: Message dictionary to send
        """
        if self._producer is None:
            raise RuntimeError("Producer not started. Call start() first.")
        
        message_bytes = json.dumps(message).encode('utf-8')
        await self._producer.send_and_wait(topic, message_bytes)
    
    @property
    def is_running(self) -> bool:
        """Check if producer is running"""
        return self._producer is not None