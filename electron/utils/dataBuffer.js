
class DataBuffer {
    constructor() {
        this.dataBuffer = this.initializeBuffer();
        this.rawBuffer = this.initializeBuffer();
    }

    initializeBuffer() {
        return {
            gyroLeft: [],
            gyroRight: [],
            accelLeft: [],
            accelRight: [],
            displacement: [],
            velocity: [],
            heading: [],
            trajectory_x: [],
            trajectory_y: [],
            timeStamp: []
        };
    }

    getDataBuffer() {
        return this.dataBuffer;
    }

    getRawDataBuffer() {
        return this.rawBuffer;
    }

    /**
     * Append data to given buffer that follows the format:
     * {
     *     gyroLeft: [],
     *     gyroRight: [],
     *     displacement: [],
     *     velocity: [],
     *     heading: [],
     *     trajectory_x: [],
     *     trajectory_y: [],
     *     timeStamp: []
     * }
     */
    appendToBuffer(data) {
        // this.dataBuffer.gyroLeft.push(data.gyroLeft);
        // this.dataBuffer.gyroRight.push(data.gyroRight);
        // this.dataBuffer.accelLeft.push(data.accelLeft);
        // this.dataBuffer.accelRight.push(data.accelRight);
        // this.dataBuffer.displacement.push(data.displacement);
        // this.dataBuffer.velocity.push(data.velocity);
        // this.dataBuffer.heading.push(data.heading);
        // this.dataBuffer.trajectory_x.push(data.trajectory_x);
        // this.dataBuffer.trajectory_y.push(data.trajectory_y);
        // this.dataBuffer.timeStamp.push(data.timeStamp);

        this.rawBuffer.gyroLeft.push(data.gyroLeft);
        this.rawBuffer.gyroRight.push(data.gyroRight);
        this.rawBuffer.accelLeft.push(data.accelLeft);
        this.rawBuffer.accelRight.push(data.accelRight);
        this.rawBuffer.displacement.push(data.displacement);
        this.rawBuffer.velocity.push(data.velocity);
        this.rawBuffer.heading.push(data.heading);
        this.rawBuffer.trajectory_x.push(data.trajectory_x);
        this.rawBuffer.trajectory_y.push(data.trajectory_y);

        // DONT FORGET YOU WROTE THIS SHIT
        this.rawBuffer.timeStamp.push(data.timeStamp);
    }

    clearBuffer() {
        this.dataBuffer = this.initializeBuffer();
    }

    clearAllBuffers() {
        this.dataBuffer = this.initializeBuffer();
        this.rawBuffer = this.initializeBuffer();
    }
}

module.exports = new DataBuffer();