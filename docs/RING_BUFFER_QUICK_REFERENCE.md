# Ring Buffer Quick Reference

## 🚀 Quick Start

The ring buffer is already integrated! Just use the recording controls normally.

## 📖 What You Need to Know

### During Recording
- **Only last 5,000 points visible** in charts
- **Performance stays constant** no matter how long you record
- **Old data automatically discarded** when buffer fills

### When Stopped
- **All 5,000 points remain visible**
- **Can request full dataset** from backend (if needed)
- **Charts toolbar** shows "All" option to load complete data

### On Restart
- **Trims back to 5,000 points**
- **Clears any cached full data**
- **Ready for new recording**

## 🔍 How to Use

### 1. Start Recording
```javascript
// User clicks "Start" button
// Ring buffer begins filling (0 → 5000 points)
```

### 2. Recording Continues
```javascript
// After 5000 points, oldest data gets overwritten
// Charts always show most recent 5000 points
// Performance: O(1) - consistently fast
```

### 3. Stop Recording
```javascript
// User clicks "Stop" button
// Current 5000 points remain visible
// Full data stored in backend
```

### 4. View Full Data (Optional)
```javascript
// In chart toolbar, select "All" from dropdown
// Fetches complete dataset from backend
// Displays all recorded points
```

### 5. Restart Recording
```javascript
// User clicks "Restart" button
// Trims to most recent 5000 points
// Clears full data cache
// Ready for new recording session
```

## ⚙️ Configuration

### Change Buffer Size

Location: `app/recorder/context/testContext.js`

```javascript
// Current: 5000 points
const ringBufferManager = useRef(new ChartRingBufferManager(5000));

// To change to 10000 points:
const ringBufferManager = useRef(new ChartRingBufferManager(10000));
```

**Memory Impact:**
- 5,000 points = ~160 KB (4 metrics × 8 bytes × 5000)
- 10,000 points = ~320 KB (4 metrics × 8 bytes × 10000)

## 🐛 Troubleshooting

### Charts Not Updating
**Check:**
1. Are you in recording mode? (Start button pressed)
2. Is BLE data being received? (Check console for "data received" logs)
3. Any console errors?

**Solution:**
```javascript
// In browser console:
// Check if data is being added to ring buffer
console.log('Ring buffer sizes:', ringBufferManager.current.getSizes());
```

### Memory Still Growing
**Check:**
1. Are you clicking "Restart" between recordings?
2. Is full data being cleared?

**Solution:**
```javascript
// Manually clear if needed:
const { ringBufferManager } = useTest();
ringBufferManager.clearFullTestData();
```

### Full Data Not Loading
**Check:**
1. Is recording stopped?
2. Is backend running?
3. Is Kafka/Redpanda running?

**Solution:**
```bash
# Check if Redpanda is running
docker ps | grep redpanda

# Restart if needed
docker-compose up -d
```

## 📊 Performance Metrics

### Expected Performance
- **Append operation:** < 0.1 ms (O(1))
- **Memory usage:** Constant at ~160 KB
- **Chart render:** < 16 ms (60 FPS)

### Warning Signs
- ❌ Append taking > 1 ms → Not using ring buffer correctly
- ❌ Memory growing over time → Full data not being cleared
- ❌ Charts stuttering → Too many points being rendered

## 🔗 Related Files

| File | Purpose |
|------|---------|
| `RingBuffer.js` | Core ring buffer implementation |
| `testContext.js` | React context with ring buffer manager |
| `controlPanel.js` | Start/Stop/Restart buttons |
| `chartSection.js` | Chart data handling |
| `kafkaService.js` | Full data storage (Electron) |

## 📚 More Information

- **Full Documentation:** `RING_BUFFER_README.md`
- **Implementation Details:** `RING_BUFFER_IMPLEMENTATION.md`
- **Visual Explanation:** `RingBuffer.visual.js`

## 💡 Tips

1. **For Short Tests (< 5000 points):**
   - Ring buffer acts like normal array
   - All data visible immediately
   - No difference in behavior

2. **For Long Tests (> 5000 points):**
   - Live view shows last 5000 points
   - Stop recording to keep current view
   - Request full data if needed for analysis

3. **For Multiple Recordings:**
   - Always click "Restart" between tests
   - Ensures clean buffer state
   - Prevents memory buildup

4. **For Best Performance:**
   - Keep buffer size at 5000-10000 points
   - Request full data only when needed
   - Clear data between major test sessions
