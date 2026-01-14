"""Data validation abstractions.

This module defines the `IDataValidator` interface used by the data
processing pipeline to validate incoming arrays before heavy calculations.
Implementations should focus on a single validation concern (e.g. length
matching) so they remain composable and testable.
"""

from abc import ABC, abstractmethod
from typing import Dict


class IDataValidator(ABC):
    """Interface for data validation (Interface Segregation Principle)."""

    @abstractmethod
    def validate(self, data: Dict) -> bool:
        """Validate input data and return True if valid."""
        pass
