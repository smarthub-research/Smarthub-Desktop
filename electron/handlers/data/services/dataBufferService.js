
class DataBuffer {
    constructor() {
        this.dataBuffer = this.initializeBuffer();
        this.rawBuffer = this.initializeBuffer();
    }

    initializeBuffer() {
        return {
            gyro_left: [],
            gyro_right: [],
            accel_left: [],
            accel_right: [],
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
     *     gyro_left: [],
     *     gyro_right: [],
     *     displacement: [],
     *     velocity: [],
     *     heading: [],
     *     trajectory_x: [],
     *     trajectory_y: [],
     *     timeStamp: []
     * }
     */
    appendToBuffer(data) {
        this.dataBuffer.gyro_left.push(data.gyro_left);
        this.dataBuffer.gyro_right.push(data.gyro_right);
        this.dataBuffer.accel_left.push(data.accel_left);
        this.dataBuffer.accel_right.push(data.accel_right);
        this.dataBuffer.displacement.push(data.displacement);
        this.dataBuffer.velocity.push(data.velocity);
        this.dataBuffer.heading.push(data.heading);
        this.dataBuffer.trajectory_x.push(data.trajectory_x);
        this.dataBuffer.trajectory_y.push(data.trajectory_y);
        this.dataBuffer.timeStamp.push(data.timeStamp);

        this.rawBuffer.gyro_left.push(data.gyro_left);
        this.rawBuffer.gyro_right.push(data.gyro_right);
        this.rawBuffer.accel_left.push(data.accel_left);
        this.rawBuffer.accel_right.push(data.accel_right);
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