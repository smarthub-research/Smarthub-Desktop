"""Message producer interface definitions.

Defines the `IMessageProducer` abstract base class used by the pipeline to
publish processed messages to external systems (for example Kafka). Concrete
producers should implement lifecycle methods and an async `send_message`
method that accepts a topic and a JSON-serializable dict.
"""

from abc import ABC, abstractmethod


class IMessageProducer(ABC):
    """Interface for message producers (Dependency Inversion Principle)."""

    @abstractmethod
    async def start(self) -> None:
        """Initialize and start the producer."""
        pass

    @abstractmethod
    async def stop(self) -> None:
        """Stop the producer and clean up resources."""
        pass

    @abstractmethod
    async def send_message(self, topic: str, message: dict) -> None:
        """Send a message to a topic."""
        pass