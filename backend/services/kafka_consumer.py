from typing import Optional, AsyncIterator
import json
from services.message_consumer import IMessageConsumer

from aiokafka import AIOKafkaConsumer

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
                # Start from latest messages only (skip old buffered messages)
                auto_offset_reset='latest',  # 'latest' = only new messages, 'earliest' = replay all
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
                print(f"Error decoding message: {e}", flush=True)
                continue
    
    @property
    def is_running(self) -> bool:
        """Check if consumer is running"""
        return self._consumer is not None
