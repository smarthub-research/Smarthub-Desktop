/**
 * High-performance circular ring buffer for chart data
 * O(1) append and read operations using typed arrays
 * Automatically overwrites oldest data when capacity is reached
 */

export class RingBuffer {
    constructor(capacity = 2000) {
        this.capacity = capacity;
        this.head = 0; // Write position
        this.size = 0; // Current number of elements
        this.buffer = null; // Will be initialized on first data
        this.keys = null; // Property names (e.g., ['time', 'distance'])
    }

    /**
     * Initialize buffer structure based on first data point
     * @param {Object} sample - Sample data point with all properties
     */
    _initialize(sample) {
        this.keys = Object.keys(sample);
        this.buffer = {};
        
        // Create typed arrays for each property
        for (const key of this.keys) {
            this.buffer[key] = new Float64Array(this.capacity);
        }
    }

    /**
     * Append data points to the buffer - O(1) operation
     * @param {Array<Object>} dataPoints - Array of data points to append
     */
    append(dataPoints) {
        if (!dataPoints || dataPoints.length === 0) return;

        // Initialize on first data
        if (!this.buffer) {
            this._initialize(dataPoints[0]);
        }

        for (const point of dataPoints) {
            // Write each property to its typed array
            for (const key of this.keys) {
                this.buffer[key][this.head] = point[key] ?? 0;
            }

            // Move head forward (circular)
            this.head = (this.head + 1) % this.capacity;
            
            // Increase size until we reach capacity
            if (this.size < this.capacity) {
                this.size++;
            }
        }
    }

    /**
     * Get all data as an array of objects - O(n) but optimized
     * Returns data in chronological order (oldest to newest)
     * @returns {Array<Object>}
     */
    toArray() {
        if (!this.buffer || this.size === 0) return [];

        const result = new Array(this.size);
        
        // Calculate start position (oldest data)
        const start = this.size < this.capacity ? 0 : this.head;

        for (let i = 0; i < this.size; i++) {
            const index = (start + i) % this.capacity;
            const point = {};
            
            for (const key of this.keys) {
                point[key] = this.buffer[key][index];
            }
            
            result[i] = point;
        }

        return result;
    }

    /**
     * Get the most recent N data points - O(n) where n = count
     * @param {number} count - Number of recent points to retrieve
     * @returns {Array<Object>}
     */
    getRecent(count) {
        if (!this.buffer || this.size === 0) return [];
        
        const actualCount = Math.min(count, this.size);
        const result = new Array(actualCount);
        
        // Start from the most recent and go backwards
        for (let i = 0; i < actualCount; i++) {
            // Calculate position: go backwards from head
            const index = (this.head - 1 - i + this.capacity) % this.capacity;
            const point = {};
            
            for (const key of this.keys) {
                point[key] = this.buffer[key][index];
            }
            
            // Store in reverse order so newest is at the end
            result[actualCount - 1 - i] = point;
        }

        return result;
    }

    /**
     * Get a slice of data - O(n) where n = count
     * @param {number} start - Start index (inclusive)
     * @param {number} end - End index (exclusive)
     * @returns {Array<Object>}
     */
    slice(start, end) {
        if (!this.buffer || this.size === 0) return [];
        
        const actualStart = Math.max(0, start);
        const actualEnd = Math.min(this.size, end);
        const count = actualEnd - actualStart;
        
        if (count <= 0) return [];

        const result = new Array(count);
        const bufferStart = this.size < this.capacity ? 0 : this.head;

        for (let i = 0; i < count; i++) {
            const index = (bufferStart + actualStart + i) % this.capacity;
            const point = {};
            
            for (const key of this.keys) {
                point[key] = this.buffer[key][index];
            }
            
            result[i] = point;
        }

        return result;
    }

    /**
     * Clear all data and reset the buffer
     */
    clear() {
        this.head = 0;
        this.size = 0;
        // Keep buffer allocated for reuse
    }

    /**
     * Get current number of data points
     * @returns {number}
     */
    getSize() {
        return this.size;
    }

    /**
     * Check if buffer is at capacity
     * @returns {boolean}
     */
    isFull() {
        return this.size >= this.capacity;
    }

    /**
     * Trim buffer to most recent N points
     * Used when restarting recording to restore ring buffer behavior
     * @param {number} newSize - New size to trim to
     */
    trimToRecent(newSize) {
        if (!this.buffer || this.size === 0) return;
        
        const targetSize = Math.min(newSize, this.size);
        
        if (targetSize >= this.size) {
            // No trimming needed
            return;
        }

        // Calculate new head position
        // We want to keep the most recent 'targetSize' elements
        const pointsToRemove = this.size - targetSize;
        
        // Simply adjust size and move the conceptual "start"
        // In a ring buffer, we can just change size since head already points to next write
        this.size = targetSize;
    }
}

/**
 * Ring buffer manager for all chart metrics
 * Manages separate ring buffers for distance, velocity, heading, and trajectory
 */
export class ChartRingBufferManager {
    constructor(capacity = 5000) {
        this.capacity = capacity;
        this.buffers = {
            distance: new RingBuffer(capacity),
            velocity: new RingBuffer(capacity),
            heading: new RingBuffer(capacity),
            trajectory: new RingBuffer(capacity)
        };
        
        // Track full dataset when stopped
        this.fullDataCache = null;
        this.isRecording = false;
    }

    /**
     * Add new data to all metric buffers
     * @param {Object} data - Data with distance, velocity, heading, trajectory arrays
     */
    addData(data) {
        if (data.distance) this.buffers.distance.append(data.distance);
        if (data.velocity) this.buffers.velocity.append(data.velocity);
        if (data.heading) this.buffers.heading.append(data.heading);
        if (data.trajectory) this.buffers.trajectory.append(data.trajectory);
    }

    /**
     * Get current viewable data (last 5000 points while recording)
     * @returns {Object} Data for all metrics
     */
    getData() {
        return {
            distance: this.buffers.distance.toArray(),
            velocity: this.buffers.velocity.toArray(),
            heading: this.buffers.heading.toArray(),
            trajectory: this.buffers.trajectory.toArray()
        };
    }

    /**
     * Get full dataset (used when recording is stopped)
     * @returns {Object} Complete data for all metrics
     */
    getFullData() {
        return this.fullDataCache || this.getData();
    }

    /**
     * Store complete dataset when stopping
     * @param {Object} fullData - Complete dataset from backend
     */
    cacheFullData(fullData) {
        this.fullDataCache = fullData;
    }

    /**
     * Clear full data cache and trim buffers when restarting
     */
    restartRecording() {
        this.fullDataCache = null;
        this.isRecording = true;
        
        // Trim each buffer to most recent 5000 points
        for (const buffer of Object.values(this.buffers)) {
            buffer.trimToRecent(this.capacity);
        }
    }

    /**
     * Mark recording as stopped
     */
    stopRecording() {
        this.isRecording = false;
    }

    /**
     * Clear all buffers
     */
    clear() {
        for (const buffer of Object.values(this.buffers)) {
            buffer.clear();
        }
        this.fullDataCache = null;
    }

    /**
     * Get buffer sizes for debugging
     */
    getSizes() {
        return {
            distance: this.buffers.distance.getSize(),
            velocity: this.buffers.velocity.getSize(),
            heading: this.buffers.heading.getSize(),
            trajectory: this.buffers.trajectory.getSize()
        };
    }
}
