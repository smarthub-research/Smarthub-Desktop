from abc import ABC, abstractmethod
from typing import Dict

class IDataValidator(ABC):
    """Interface for data validation (Interface Segregation Principle)"""
    
    @abstractmethod
    def validate(self, data: Dict) -> bool:
        """Validate input data"""
        pass
