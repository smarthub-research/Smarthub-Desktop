from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import asyncio

from routers import auth, db, calibrate
from constants import (
    ALLOWED_ORIGINS, API_HOST, API_PORT, KAFKA_BOOTSTRAP, RECORDING_EVENTS_TOPIC,
    RAW_TOPIC, RESULT_TOPIC, left_gain, right_gain,
    WHEEL_DIAM_IN, DIST_WHEELS_IN
)
from services.kafka_service import KafkaMessageProducer
from services.message_handler import MessageProcessingPipeline
from services.service_factory import ServiceFactory


class ApplicationState:
    """
    Manages application-wide state and dependencies.
    Single Responsibility: Centralize dependency management.
    """
    
    def __init__(self):
        self.producer: KafkaMessageProducer | None = None
        self.pipeline: MessageProcessingPipeline | None = None
        self.processing_task: asyncio.Task | None = None


# Application state instance
app_state = ApplicationState()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan manager.
    Handles startup and shutdown with proper dependency injection.
    """
    print("\n" + "=" * 60)
    print("FastAPI + Kafka Processing Pipeline Starting")
    print("=" * 60)
    
    # Startup - Use factory pattern to create all dependencies
    factory = ServiceFactory(
        kafka_bootstrap=KAFKA_BOOTSTRAP,
        raw_topic=RAW_TOPIC,
        result_topic=RESULT_TOPIC,
        recording_events_topic=RECORDING_EVENTS_TOPIC,
        left_gain=left_gain,
        right_gain=right_gain,
        wheel_diameter=WHEEL_DIAM_IN,
        dist_wheels=DIST_WHEELS_IN,
        cutoff_freq=6.0
    )
    
    # Create processing pipeline with all dependencies wired
    pipeline = factory.create_processing_pipeline()
    
    # Start pipeline (consumer will join group immediately)
    print("⏳ Starting Kafka consumer and producer...")
    print(f"   └─ Consuming from: {RAW_TOPIC}, {RECORDING_EVENTS_TOPIC}")
    print(f"   └─ Producing to: {RESULT_TOPIC}")
    print(f"   └─ Calibration: L={left_gain}, R={right_gain}")
    print(f"   └─ Wheel: {WHEEL_DIAM_IN}\" diameter, {DIST_WHEELS_IN}\" apart")
    
    import time
    start_time = time.time()
    
    await pipeline.start()
    
    elapsed = time.time() - start_time
    print(f"\n✅ Kafka pipeline started in {elapsed:.2f}s")
    
    # Store in app state for access by routes
    app_state.producer = factory.create_producer()
    await app_state.producer.start()
    app_state.pipeline = pipeline
    
    # Start background processing task
    print("⏳ Starting background message processor...")
    app_state.processing_task = asyncio.create_task(pipeline.process_messages())
    
    print("\n" + "=" * 60)
    print("🚀 FastAPI + Kafka Ready!")
    print("=" * 60)
    print(f"   └─ API: http://{API_HOST}:{API_PORT}")
    print(f"   └─ Kafka: {KAFKA_BOOTSTRAP}")
    print(f"   └─ Consumer Group: packet-processor-group")
    print("=" * 60 + "\n")
    
    yield
    
    # Shutdown - Clean up resources
    print("\n⏳ Shutting down Kafka pipeline...")
    
    if app_state.processing_task:
        app_state.processing_task.cancel()
        try:
            await app_state.processing_task
        except asyncio.CancelledError:
            pass
    
    if app_state.pipeline:
        await app_state.pipeline.stop()
    
    if app_state.producer:
        await app_state.producer.stop()
    
    print("✅ Kafka pipeline stopped cleanly.\n")


app = FastAPI(lifespan=lifespan)

app.include_router(auth.router)
app.include_router(db.router)
app.include_router(calibrate.router)

# Import and include health router
from routers import health
app.include_router(health.router)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_producer() -> KafkaMessageProducer:
    """
    Dependency injection for routes.
    Allows routes to get the producer instance.
    """
    if app_state.producer is None:
        raise RuntimeError("Application not properly initialized")
    return app_state.producer


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host=API_HOST, port=API_PORT)
    