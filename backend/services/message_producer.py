from abc import ABC, abstractmethod

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