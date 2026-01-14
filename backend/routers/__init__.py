"""
backend.routers
Package initializer for API routers. Kept intentionally minimal – routers
are registered in the main application import and individual router modules
live in this package. This file can be used to perform package-level
imports if you want to expose router objects at package import time.
"""

# Example (uncomment to expose routers at package level):
# from .auth import router as auth_router
# from .db import router as db_router
