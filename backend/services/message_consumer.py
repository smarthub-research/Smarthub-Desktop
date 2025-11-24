from abc import ABC, abstractmethod
from typing import AsyncIterator

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