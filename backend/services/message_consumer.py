"""Message consumer interface definitions.

This module defines the `IMessageConsumer` abstract base class used by the
message processing pipeline. Concrete implementations (for example Kafka
consumers) must implement start/stop lifecycle methods and an async message
iterator method `consume_messages` that yields parsed messages.
"""

from abc import ABC, abstractmethod
from typing import AsyncIterator


class IMessageConsumer(ABC):
    """Interface for message consumers (Dependency Inversion Principle).

    Implementations should manage their own network/connection resources and
    expose an async iterator for incoming messages so the pipeline can
    consume them in a generic manner.
    """

    @abstractmethod
    async def start(self) -> None:
        """Initialize and start the consumer."""
        pass

    @abstractmethod
    async def stop(self) -> None:
        """Stop the consumer and clean up resources."""
        pass

    @abstractmethod
    def consume_messages(self) -> AsyncIterator[dict]:
        """Consume messages from subscribed topics as an async iterator."""
        pass