/**
 * VISUAL EXPLANATION OF RING BUFFER
 * 
 * Imagine a circular track with 5000 positions marked around it.
 * The "head" pointer walks around the track, writing data at each position.
 * When it completes a lap, it starts overwriting the oldest data.
 * 
 * INITIAL STATE (Empty Buffer):
 * ┌───┬───┬───┬───┬───┬───┬───┬───┐
 * │ 0 │ 1 │ 2 │ 3 │ 4 │...│4998│4999│
 * │   │   │   │   │   │   │   │    │  (all empty)
 * └───┴───┴───┴───┴───┴───┴───┴────┘
 *   ↑
 *  head = 0
 *  size = 0
 * 
 * AFTER WRITING 3 DATA POINTS:
 * ┌───┬───┬───┬───┬───┬───┬───┬───┐
 * │ A │ B │ C │   │   │...│   │    │
 * └───┴───┴───┴───┴───┴───┴───┴────┘
 *               ↑
 *              head = 3
 *              size = 3
 * 
 * AFTER BUFFER IS FULL (5000 points):
 * ┌───┬───┬───┬───┬───┬───┬───┬────┐
 * │ D │ D │ D │ D │ D │...│ D │ D  │  (all filled with data)
 * └───┴───┴───┴───┴───┴───┴───┴────┘
 *   ↑
 *  head = 0 (wrapped around)
 *  size = 5000
 * 
 * AFTER WRITING 1 MORE POINT (overwrites oldest):
 * ┌───┬───┬───┬───┬───┬───┬───┬────┐
 * │ E │ D │ D │ D │ D │...│ D │ D  │
 * └───┴───┴───┴───┴───┴───┴───┴────┘
 *       ↑
 *      head = 1 (overwrote position 0)
 *      size = 5000 (still)
 * 
 * WHY THIS IS O(1):
 * 
 * 1. Writing: Just set buffer[head] = value, then head++
 *    - No array resizing
 *    - No memory allocation
 *    - No copying of data
 * 
 * 2. Reading: Walk from oldest to newest
 *    - Start position = (head) if not full, or (head) if full
 *    - Just read each position in order
 * 
 * COMPARISON:
 * 
 * Array Spreading (OLD):
 *   newArray = [...oldArray, ...newData]
 *   ↓
 *   1. Allocate new array (size = old + new)
 *   2. Copy ALL old data to new array  ← O(n) - SLOW!
 *   3. Copy new data to end
 *   4. Garbage collect old array
 * 
 * Ring Buffer (NEW):
 *   buffer[head] = newValue
 *   head = (head + 1) % capacity
 *   ↓
 *   1. Write to existing position  ← O(1) - FAST!
 *   2. Move pointer
 *   3. Done!
 * 
 * MEMORY COMPARISON:
 * 
 * After 50,000 data points:
 * 
 * OLD (Array Spreading):
 *   [50,000 points] = 50,000 × 32 bytes = 1.6 MB
 *   Plus intermediate arrays during copying = 3-4 MB peak
 * 
 * NEW (Ring Buffer):
 *   [5,000 points] = 5,000 × 8 bytes (Float64) = 40 KB
 *   Always = 40 KB (per metric)
 * 
 * REAL-WORLD EXAMPLE:
 * 
 * Recording at 100 Hz (100 data points per second):
 * 
 * Time    | Points | OLD Memory | NEW Memory | OLD Speed | NEW Speed
 * --------|--------|------------|------------|-----------|----------
 * 10 sec  | 1,000  | 32 KB      | 40 KB      | 1 ms      | 0.1 ms
 * 1 min   | 6,000  | 192 KB     | 40 KB      | 6 ms      | 0.1 ms
 * 10 min  | 60,000 | 1.9 MB     | 40 KB      | 60 ms     | 0.1 ms ← LAG!
 * 1 hour  | 360K   | 11 MB      | 40 KB      | 360 ms    | 0.1 ms ← FREEZE!
 * 
 * Notice: Ring buffer maintains constant O(1) performance!
 */

// This file is for documentation only
export {};