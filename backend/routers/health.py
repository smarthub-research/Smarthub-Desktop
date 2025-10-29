"""
Health check and status endpoints.
"""
from fastapi import APIRouter

router = APIRouter(prefix="/health", tags=["health"])


@router.get("/")
async def health_check():
    """
    Basic health check endpoint.
    """
    return {
        "status": "healthy",
        "service": "smarthub-backend"
    }


@router.get("/kafka")
async def kafka_status():
    """
    Check Kafka consumer status.
    Returns whether the Kafka pipeline is ready to process messages.
    """
    from main import app_state
    
    pipeline_exists = app_state.pipeline is not None
    producer_exists = app_state.producer is not None
    processing_task_active = app_state.processing_task is not None and not app_state.processing_task.done()
    
    # Check if producer is running (has is_running property)
    producer_running = False
    if producer_exists and app_state.producer is not None and hasattr(app_state.producer, 'is_running'):
        producer_running = app_state.producer.is_running
    
    is_ready = pipeline_exists and producer_running and processing_task_active
    
    return {
        "status": "ready" if is_ready else "not_ready",
        "pipeline_exists": pipeline_exists,
        "producer_running": producer_running,
        "processing_active": processing_task_active,
        "ready": is_ready
    }
