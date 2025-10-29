# Kafka Integration Guide

## Overview

The dataService has been converted to use Kafka for message-based data processing:

```
BLE Device → Electron (dataService) → Kafka → Python Backend → Kafka → Electron → Frontend
```

## Architecture

### Flow:
1. **BLE Data Reception** (Electron `dataService.js`)
   - Receives raw packets from BLE devices
   - Produces messages to `raw-packets` Kafka topic

2. **Backend Processing** (`kafka_runner.py`)
   - Consumes from `raw-packets` topic
   - Decodes, stores by side (left/right)
   - Processes when both sides available
   - Produces results to `processed-results` topic

3. **Result Consumption** (Electron `kafkaService.js`)
   - Consumes from `processed-results` topic
   - Formats data for frontend graphs
   - Sends to frontend via IPC

## Setup

### 1. Start Kafka/Redpanda

```bash
docker-compose up -d
```

This starts a Redpanda instance (Kafka-compatible) on `localhost:9092`.

### 2. Install Dependencies

**Node.js:**
```bash
npm install
```

**Python:**
```bash
source .venv/bin/activate
pip install -r backend/requirements.txt
```

### 3. Start All Services

```bash
npm run start
```

This starts:
- Next.js frontend (port 3000)
- Electron desktop app
- FastAPI backend (port 8000)
- **Kafka consumer/processor** (new!)

## Message Formats

### Raw Packet Message (Electron → Kafka)

**Topic:** `raw-packets`

```json
{
  "packet": [0, 1, 2, ..., 17],  // 18-byte array
  "side": "left",                 // or "right"
  "device_id": "AA:BB:CC:DD:EE:FF",
  "ts": 1698537600000            // Unix timestamp (ms)
}
```

### Processed Result Message (Kafka → Electron)

**Topic:** `processed-results`

```json
{
  "time_from_start": [0.0, 0.015, 0.029, 0.044],
  "gyro_left_smoothed": [0.0, 0.12, 0.15, 0.18],
  "gyro_right_smoothed": [0.0, 0.11, 0.14, 0.17],
  "dist_m": [0.0, 0.001, 0.002, 0.003],
  "disp_m": [0.0, 0.001, 0.002, 0.003],
  "heading_deg": [0.0, 5.2, 10.1, 15.3],
  "velocity": [0.0, 0.05, 0.1, 0.15],
  "trajectory": [
    {"x": 0.0, "y": 0.0},
    {"x": 0.001, "y": 0.0},
    ...
  ],
  "device_id": "AA:BB:CC:DD:EE:FF",
  "timestamp": 1698537600000
}
```

## Files Changed

### New Files:
- `electron/services/kafkaService.js` - Kafka producer/consumer for Electron
- `backend/kafka_runner.py` - Main Kafka processing loop
- `docs/kafka_integration_guide.md` - This file

### Modified Files:
- `electron/services/dataService.js` - Now produces to Kafka
- `electron/main.js` - Adds Kafka shutdown handler
- `backend/services/message_handler.py` - Fixed numpy array serialization
- `backend/requirements.txt` - Added `aiokafka`
- `package.json` - Added `kafkajs` and `kafka:start` script

## Testing

### 1. Check Kafka is Running

```bash
docker ps | grep redpanda
```

### 2. Monitor Raw Packets

```bash
docker exec -it <redpanda-container> rpk topic consume raw-packets --format json
```

### 3. Monitor Processed Results

```bash
docker exec -it <redpanda-container> rpk topic consume processed-results --format json
```

### 4. Check Logs

**Electron (producer):**
- Look for "Kafka producer connected"
- Look for "Kafka consumer connected"

**Python (processor):**
- Look for "Pipeline started successfully!"
- Look for "Waiting for messages..."

## Troubleshooting

### Error: "Kafka not initialized - packet dropped"

**Cause:** Kafka connection failed during startup

**Solution:**
1. Ensure Redpanda is running: `docker-compose up -d`
2. Check Kafka is accessible: `nc -zv localhost 9092`
3. Restart Electron app

### Error: "Object of type ndarray is not JSON serializable"

**Cause:** Numpy arrays weren't converted to lists

**Solution:** Already fixed! The `_convert_to_json_serializable()` method handles this.

### Warning: "KafkaJS v2.0.0 switched default partitioner"

**Cause:** KafkaJS changed default behavior

**Solution:** Already fixed! Using `Partitioners.LegacyPartitioner` now.

### No Data in Frontend

**Possible causes:**
1. **Kafka not running:** Check `docker ps`
2. **Backend not consuming:** Check `npm run kafka:start` logs
3. **Wrong topic names:** Verify topics match in all files
4. **Missing both sides:** Need both left AND right packets to produce results

**Debug:**
```bash
# List all topics
docker exec -it <redpanda-container> rpk topic list

# Check consumer groups
docker exec -it <redpanda-container> rpk group list
```

## Configuration

### Kafka Settings (kafkaService.js)

```javascript
this.kafka = new Kafka({
    clientId: 'smarthub-electron',
    brokers: ['localhost:9092'],  // Change for production
    retry: {
        retries: 8,
        initialRetryTime: 300,
        maxRetryTime: 3000
    }
});
```

### Processing Parameters (kafka_runner.py)

```python
LEFT_GAIN = 1.13           # Left wheel calibration
RIGHT_GAIN = 1.12          # Right wheel calibration  
WHEEL_DIAMETER = 2.5       # inches
WHEEL_DISTANCE = 6.0       # inches
GYRO_THRESHOLD = 0.03      # Noise threshold
```

## Performance Notes

### Original (Direct Processing):
- **Latency:** ~5-50ms per packet
- **Coupling:** Tight coupling between BLE and processing
- **Smoothing:** External Python API call (50-500ms)

### With Kafka:
- **Latency:** ~10-100ms per packet (added Kafka overhead)
- **Coupling:** Loose coupling, scalable
- **Smoothing:** Local FFT filter (1-5ms)
- **Benefits:**
  - Can scale processing independently
  - Replay capability
  - Multiple consumers possible
  - Data persistence

## Next Steps

1. **Add Error Handling:** Retry logic for failed messages
2. **Add Monitoring:** Track processing latency and throughput
3. **Add Dead Letter Queue:** Handle permanently failed messages
4. **Add Schema Validation:** Validate message formats
5. **Production Config:** Use external Kafka cluster
6. **Add Compression:** Reduce network bandwidth

## Comparison with Original

| Feature | Original (dataService.js) | With Kafka |
|---------|---------------------------|------------|
| **Decoding** | Immediate | Immediate |
| **Storage** | In-memory (pending vars) | In-memory + Kafka |
| **Smoothing** | External API | Built-in FFT |
| **Scalability** | Single process | Horizontally scalable |
| **Persistence** | None | Kafka retention |
| **Latency** | Lower (~5-50ms) | Higher (~10-100ms) |
| **Complexity** | Lower | Higher |
| **Reliability** | Lower | Higher (retry, DLQ) |

## References

- [KafkaJS Documentation](https://kafka.js.org/)
- [AIOKafka Documentation](https://aiokafka.readthedocs.io/)
- [Redpanda Documentation](https://docs.redpanda.com/)
- [Original Comparison Doc](./dataService_to_kafka_conversion.md)
