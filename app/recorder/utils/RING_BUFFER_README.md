# Ring Buffer Implementation for Chart Data

## Overview

This ring buffer implementation provides **O(1) append operations** for real-time chart data streaming, maintaining a fixed window of 5,000 data points to ensure consistent performance regardless of recording duration.

## Architecture

### Core Components

1. **`RingBuffer`** - Low-level circular buffer using typed arrays
2. **`ChartRingBufferManager`** - High-level manager for all chart metrics
3. **`testContext.js`** - React context integration
4. **`chartSection.js`** - Chart component integration

## How It Works

### Ring Buffer Mechanics

The ring buffer uses **Float64Array** (typed arrays) for optimal memory performance:

```javascript
// Fixed-size buffer with circular write pointer
buffer = {
  time: Float64Array(5000),
  distance: Float64Array(5000),
  velocity: Float64Array(5000),
  // ... other metrics
}

// Write position wraps around when reaching capacity
head = (head + 1) % capacity
```

### Data Flow

```
Backend (Kafka) 
    ↓
Electron (kafkaService)
    ↓ IPC: 'new-ble-data'
React Context (testContext)
    ↓ ringBufferManager.addData() [O(1)]
Charts (Graph components)
    ↓ Display last 5000 points
User sees real-time data
```

## Performance Benefits

### Before (Array Spreading)
```javascript
// O(n) - Creates new array every time
setData(prev => [...prev, ...newData])
// With 50,000 points: ~50ms per update
```

### After (Ring Buffer)
```javascript
// O(1) - Overwrites old data in-place
ringBuffer.append(newData)
// With any amount of data: ~0.1ms per update
```

### Memory Usage
- **Fixed**: 5,000 points × 4 metrics × 8 bytes = ~160 KB
- **Predictable**: No memory growth over time
- **Efficient**: Typed arrays are faster than regular arrays

## Recording States

### 1. **Recording (Active)**
- Ring buffer maintains last 5,000 points
- Old data automatically overwritten
- Charts update in real-time with O(1) performance

### 2. **Stopped**
- Ring buffer retains current data
- User can request full dataset from backend
- Full data cached in `fullDataCache`

### 3. **Restart**
- Full data cache cleared
- Ring buffer trimmed to last 5,000 points
- Ready for new recording session

## API Usage

### In Components

```javascript
import { useTest } from './context/testContext';

function MyComponent() {
  const { 
    processedPackets,      // Current viewable data
    addProcessedData,      // Add new data (O(1))
    fetchFullData,         // Get full dataset when stopped
    ringBufferManager      // Direct access to buffer
  } = useTest();
  
  // Get buffer statistics
  const sizes = ringBufferManager.getSizes();
  console.log(`Distance points: ${sizes.distance}`);
}
```

### Key Methods

#### `addProcessedData(data)`
Adds new data to ring buffer (O(1) operation)
```javascript
addProcessedData({
  distance: [{time: 1.0, distance: 5.2}, ...],
  velocity: [{time: 1.0, velocity: 2.1}, ...],
  heading: [{time: 1.0, heading: 45.0}, ...],
  trajectory: [{trajectory_x: 0, trajectory_y: 0}, ...]
});
```

#### `fetchFullData()`
Retrieves complete dataset from backend (only when stopped)
```javascript
const fullData = await fetchFullData();
// Returns all data points, not just last 5000
```

#### `handleRestartRecording()`
Trims buffers back to 5,000 points
```javascript
handleRestartRecording();
// Clears full data cache
// Keeps most recent 5000 points
```

## Integration Points

### 1. **testContext.js**
- Creates `ChartRingBufferManager` instance
- Manages recording state
- Handles data fetching

### 2. **controlPanel.js**
- Triggers start/stop/restart events
- Calls context handlers

### 3. **chartSection.js**
- Receives BLE data
- Calls `addProcessedData()`
- Handles restart cleanup

### 4. **Electron/Kafka**
- `kafkaService.js` accumulates full dataset
- `preload.js` exposes `getFullTestData()` API
- `dataHandlers.js` handles full data requests

## Configuration

### Adjust Ring Buffer Size

```javascript
// In testContext.js
const ringBufferManager = useRef(
  new ChartRingBufferManager(10000) // Change to 10,000 points
);
```

### Typed Array Selection

Current: `Float64Array` (double precision, 8 bytes)
- Most accurate for scientific data
- Can use `Float32Array` (4 bytes) for 50% memory savings if precision allows

## Debugging

### Check Buffer Status
```javascript
// In any component with useTest()
const { ringBufferManager } = useTest();

console.log('Sizes:', ringBufferManager.getSizes());
console.log('Is full:', ringBufferManager.buffers.distance.isFull());
console.log('Current size:', ringBufferManager.buffers.distance.getSize());
```

### Verify Data Flow
```javascript
// In chartSection.js handleData function
console.log('New data received:', data);
console.log('Buffer size before:', ringBufferManager.current.getSizes());
addProcessedData(data);
console.log('Buffer size after:', ringBufferManager.current.getSizes());
```

## Troubleshooting

### Charts Not Updating
1. Check if `addProcessedData()` is being called
2. Verify BLE data listener is registered
3. Check browser console for errors

### Memory Still Growing
1. Ensure `restartRecording()` is called on restart
2. Verify ring buffer capacity is fixed
3. Check for data leaks in other components

### Full Data Not Loading
1. Verify `getFullTestData` IPC handler exists
2. Check `kafkaService.fullTestData` is populated
3. Ensure recording is stopped before requesting

## Future Enhancements

1. **Web Workers**: Move buffer operations to background thread
2. **Compression**: Apply data compression for historical storage
3. **Adaptive Sizing**: Dynamically adjust buffer size based on data rate
4. **Persistence**: Save buffer state to IndexedDB for page refresh recovery
