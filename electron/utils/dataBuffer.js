
/**
 * In-memory data buffers used by the renderer/main process to accumulate
 * telemetry from devices during a recording session.
 *
 * There are two buffers:
 * - `dataBuffer`: intended as a processed/consumed view (not currently used)
 * - `rawBuffer`: the live raw telemetry as it arrives (this is the primary
 *   buffer used by snapshotting and test exports)
 *
 * Each buffer is an object of parallel arrays (timestamps, gyroLeft, etc.).
 */

class DataBuffer {
    constructor() {
        this.dataBuffer = this.initializeBuffer();
        this.rawBuffer = this.initializeBuffer();
    }

    // Create a fresh buffer structure with empty arrays for each metric
    initializeBuffer() {
        return {
            gyroLeft: [],
            gyroRight: [],
            accelLeft: [],
            accelRight: [],
            displacement: [],
            distance: [],
            velocity: [],
            heading: [],
            trajectory_x: [],
            trajectory_y: [],
            timeStamp: []
        };
    }

    // Accessor for the (currently unused) processed buffer
    getDataBuffer() {
        return this.dataBuffer;
    }

    // Accessor for the live raw telemetry buffer used for snapshots
    getRawDataBuffer() {
        return this.rawBuffer;
    }

    /**
     * Append a telemetry sample to the live raw buffer.
     *
     * Expected `data` shape: contains scalars / values for each metric.
     * We push values onto each array so indexes remain aligned across metrics.
     */
    appendToBuffer(data) {
        this.rawBuffer.gyroLeft.push(data.gyroLeft);
        this.rawBuffer.gyroRight.push(data.gyroRight);
        this.rawBuffer.accelLeft.push(data.accelLeft);
        this.rawBuffer.accelRight.push(data.accelRight);
        this.rawBuffer.displacement.push(data.displacement);
        this.rawBuffer.distance.push(data.distance);
        this.rawBuffer.velocity.push(data.velocity);
        this.rawBuffer.heading.push(data.heading);
        this.rawBuffer.trajectory_x.push(data.trajectory_x);
        this.rawBuffer.trajectory_y.push(data.trajectory_y);
        // Keep timestamps aligned with metric arrays
        this.rawBuffer.timeStamp.push(data.timeStamp);
    }

    // Reset only the processed view buffer (used if/when processing is added)
    clearBuffer() {
        this.dataBuffer = this.initializeBuffer();
    }

    // Reset both live and processed buffers (clear recording state)
    clearAllBuffers() {
        this.dataBuffer = this.initializeBuffer();
        this.rawBuffer = this.initializeBuffer();
    }
}

module.exports = new DataBuffer();