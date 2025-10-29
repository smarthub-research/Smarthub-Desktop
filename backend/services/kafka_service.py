"""
Kafka service abstractions following SOLID principles.
Provides interfaces and implementations for Kafka operations.
"""
from abc import ABC, abstractmethod
from typing import Optional, AsyncIterator
import json

from aiokafka import AIOKafkaProducer, AIOKafkaConsumer


class IMessageProducer(ABC):
    """Interface for message producers (Dependency Inversion Principle)"""
    
    @abstractmethod
    async def start(self) -> None:
        """Initialize and start the producer"""
        pass
    
    @abstractmethod
    async def stop(self) -> None:
        """Stop the producer and cleanup resources"""
        pass
    
    @abstractmethod
    async def send_message(self, topic: str, message: dict) -> None:
        """Send a message to a topic"""
        pass


class IMessageConsumer(ABC):
    """Interface for message consumers (Dependency Inversion Principle)"""
    
    @abstractmethod
    async def start(self) -> None:
        """Initialize and start the consumer"""
        pass
    
    @abstractmethod
    async def stop(self) -> None:
        """Stop the consumer and cleanup resources"""
        pass
    
    @abstractmethod
    def consume_messages(self) -> AsyncIterator[dict]:
        """Consume messages from subscribed topics"""
        pass


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


class KafkaMessageConsumer(IMessageConsumer):
    """
    Kafka implementation of message consumer.
    Single Responsibility: Only handles Kafka message consumption.
    """
    
    def __init__(self, bootstrap_servers: str, topics: list[str], group_id: str):
        """
        Initialize consumer with configuration.
        
        :param bootstrap_servers: Kafka bootstrap server address
        :param topics: List of topics to subscribe to
        :param group_id: Consumer group ID
        """
        self._bootstrap_servers = bootstrap_servers
        self._topics = topics
        self._group_id = group_id
        self._consumer: Optional[AIOKafkaConsumer] = None
    
    async def start(self) -> None:
        """Start the Kafka consumer"""
        if self._consumer is None:
            self._consumer = AIOKafkaConsumer(
                *self._topics,
                bootstrap_servers=self._bootstrap_servers,
                group_id=self._group_id,
                # Optimize consumer group coordination
                session_timeout_ms=10000,  # Faster failure detection (default 10s)
                heartbeat_interval_ms=3000,  # Frequent heartbeats (default 3s)
                max_poll_interval_ms=300000,  # 5 min max processing time
                enable_auto_commit=True,
                auto_commit_interval_ms=1000,  # Commit offsets every second
                # Performance optimizations
                fetch_min_bytes=1,  # Don't wait for batching
                fetch_max_wait_ms=500,  # Max 500ms wait for messages
            )
            await self._consumer.start()
    
    async def stop(self) -> None:
        """Stop the Kafka consumer"""
        if self._consumer:
            await self._consumer.stop()
            self._consumer = None
    
    async def consume_messages(self) -> AsyncIterator[dict]:
        """
        Consume messages from subscribed topics.
        Yields parsed JSON messages.
        """
        if self._consumer is None:
            raise RuntimeError("Consumer not started. Call start() first.")
        
        async for message in self._consumer:
            try:
                message_bytes = message.value
                if message_bytes is not None:
                    data = json.loads(message_bytes.decode('utf-8'))
                    yield data
            except json.JSONDecodeError as e:
                print(f"Error decoding message: {e}")
                continue
    
    @property
    def is_running(self) -> bool:
        """Check if consumer is running"""
        return self._consumer is not None
