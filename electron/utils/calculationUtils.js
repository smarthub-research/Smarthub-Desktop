const constants = require("../config/constants");
const calibration = require("../services/calibrationService");

class CalculationUtils {
    constructor() {
        this.lastDisplacement = null
        this.lastVelocity = null
        this.lastHeading = null
        this.lastTrajX = null
        this.lastTrajY = null
    }

    /**
     * Decodes raw sensor data into acceleration and gyroscope arrays.
     * @param {Array<number>} data - Raw sensor data array.
     * @param {Array<number>} accelData - Output array for acceleration data.
     * @param {Array<number>} gyroData - Output array for gyroscope data.
     *  :param raw_data: raw data as 18 len bytearray
        :returns  accel_data: list of 4 acceleration data floats
                    gyro_data: list of 4 gyro data floats

        converts raw data from smarthub to true acceleration and gyro data
        set as @staticmethod so we can call it from other classes

        format of raw data:
        ┏---┓
        ┃ 0 ┃ sign bits for accel data  0b00001111 if all 4 negative
        ┗---┛
        ┏---┓
        ┃ 1 ┃ sign bits for gyro data  0b00001111 if all 4 negative
        ┗---┛
        ┏---┓┏---┓
        ┃ 2 ┃┃ 3 ┃ accel data 1 (LSB first) | unsigned value, divide by 1000 to get true accel data
        ┗---┗┗---┛
        ┏---┓┏---┓
        ┃ 4 ┃┃ 5 ┃ accel data 2
        ┗---┗┗---┛
        ┏---┓┏---┓
        ┃ 6 ┃┃ 7 ┃ accel data 3
        ┗---┗┗---┛
        ┏---┓┏---┓
        ┃ 8 ┃┃ 9 ┃ accel data 4
        ┗---┗┗---┛
        ┏----┓┏----┓
        ┃ 10 ┃┃ 11 ┃ gyro data 1 (LSB first) | unsigned value, divide by 100 to get true gyro data
        ┗----┗┗----┛
        ┏----┓┏----┓
        ┃ 12 ┃┃ 13 ┃ gyro data 2
        ┗----┗┗----┛
        ┏----┓┏----┓
        ┃ 14 ┃┃ 15 ┃ gyro data 3
        ┗----┗┗----┛
        ┏----┓┏----┓
        ┃ 16 ┃┃ 17 ┃ gyro data 4
        ┗----┗┗----┛

        1 refers to oldest data, 4 refers to newest data
    */
    decodeSensorData(data, accelData, gyroData) {
        for (let i = 0; i < 4; i++) {
            accelData.push((data[2 * i + 2] + data[2 * i + 3] * 256) / 1000);
            gyroData.push((data[2 * i + 10] + data[2 * i + 11] * 256) / 100);

            if ((data[0] & (1 << i)) !== 0) {
                accelData[i] *= -1;
            }

            if ((data[1] & (1 << i)) !== 0) {
                gyroData[i] *= -1;
            }
        }
    }

    /**
     * Main calculation function to compute velocity, displacement, heading, and trajectory.
     * @param {Array<number>} timeStamps - Array of timestamps (seconds).
     * @param {Array<number>} gyroDataLeft - Left wheel gyroscope data (rps).
     * @param {Array<number>} gyroDataRight - Right wheel gyroscope data (rps).
     * @param {Array<number>} accelDataLeft - Left wheel acceleration data.
     * @param {Array<number>} accelDataRight - Right wheel acceleration data.
     * @param {number} [wheelDiameter=constants.WHEEL_DIAM_IN] - Wheel diameter (inches).
     * @returns {Object} Calculation results including velocity, displacement, heading, trajectory, and timestamp.
     */
    calc(timeStamps, gyroDataLeft, gyroDataRight, accelDataLeft, accelDataRight, wheelDiameter = constants.WHEEL_DIAM_IN) {

        const velocity = this.getVelocity(gyroDataLeft, gyroDataRight, wheelDiameter);
        const displacement = this.getDisplacement(timeStamps, gyroDataLeft, gyroDataRight, wheelDiameter);
        const heading = this.getHeading(timeStamps, gyroDataLeft, gyroDataRight, wheelDiameter);
        const traj = this.getTraj(velocity, heading, timeStamps);
        return {
            gyroLeft: gyroDataLeft,
            gyroRight: gyroDataRight,
            accelLeft: accelDataLeft,
            accelRight: accelDataRight,
            displacement: displacement,
            velocity: velocity,
            heading: heading,
            trajectory_y: traj.y,
            trajectory_x: traj.x,
            timeStamp: timeStamps
        };
    }

    /**
     * Calculates displacement (meters) at each time step.
     * @param {Array<number>} timeStamps - Array of timestamps (seconds).
     * @param {Array<number>} gyroLeft - Left wheel rotation rates (rps).
     * @param {Array<number>} gyroRight - Right wheel rotation rates (rps).
     * @param {number} [diameter=constants.WHEEL_DIAM_IN] - Wheel diameter (inches).
     * @returns {Array<number>} Displacement at each time step (meters).
     */
    getDisplacement(timeStamps, gyroLeft, gyroRight, diameter = constants.WHEEL_DIAM_IN) {
        const IN_TO_M = constants.IN_TO_M || 0.0254;


        // Initialize with the last displacement value or 0 if this is the first calculation
        let dist_m = [this.lastDisplacement || 0];

        // Calculate displacement using wheel circumference and average rotation rate
        for (let i = 0; i < gyroRight.length - 1; i++) {
            const dx_r = (gyroLeft[i]+gyroRight[i])/2 * (timeStamps[i + 1] - timeStamps[i]);
            const dx_m = dx_r * (diameter * IN_TO_M / 2);
            dist_m.push(dx_m + dist_m[dist_m.length - 1]);
        }
        this.lastDisplacement = dist_m[dist_m.length - 1]

        return dist_m;
    }

    /**
     * Calculates velocity (m/s) at each time step.
     * @param {Array<number>} gyroLeft - Left wheel rotation rates (rps).
     * @param {Array<number>} gyroRight - Right wheel rotation rates (rps).
     * @param {number} [diameter=constants.WHEEL_DIAM_IN] - Wheel diameter (inches).
     * @returns {Array<number>} Velocity at each time step (m/s).
     */
    getVelocity(gyroLeft, gyroRight, diameter = constants.WHEEL_DIAM_IN) {
        const IN_TO_M = constants.IN_TO_M || 0.0254;
        let vel_ms = [this.lastVelocity || 0 ];
        for (let i = 0; i < gyroRight.length - 1; i++) {
            const v_r = gyroRight[i] * diameter / 2 * IN_TO_M;
            const v_l = gyroLeft[i] * diameter / 2 * IN_TO_M;
            const v_curr = (v_r + v_l) / 2;
            vel_ms.push(v_curr);
        }
        this.lastVelocity = vel_ms[vel_ms.length - 1]

        return vel_ms;
    }

    /**
     * Calculates heading (degrees) at each time step.
     * @param {Array<number>} timeStamps - Array of timestamps (seconds).
     * @param {Array<number>} gyroLeft - Left wheel rotation rates (rps).
     * @param {Array<number>} gyroRight - Right wheel rotation rates (rps).
     * @param {number} [diameter=constants.WHEEL_DIAM_IN] - Wheel diameter (inches).
     * @returns {Array<number>} Heading at each time step (degrees).
     */
    getHeading(timeStamps, gyroLeft, gyroRight, diameter = constants.WHEEL_DIAM_IN) {
        // Initialize with the last heading value or 0 if this is the first calculation
        let heading_deg = [this.lastHeading || 0];
        const wheelDistance = calibration.getCalibration() ? calibration.wheelDistance : constants.DIST_WHEELS_IN;
        for (let i = 0; i < gyroRight.length - 1; i++) {
            // Left is positive right is negative
            const w = ((gyroRight[i] - gyroLeft[i]) * diameter * constants.IN_TO_M / 2) / (wheelDistance * constants.IN_TO_M);
            const dt = timeStamps[i + 1] - timeStamps[i];
            let dh = w * dt;
            dh = dh * 180 / Math.PI;
            heading_deg.push(dh + heading_deg[heading_deg.length - 1]);
        }
        
        // Update the last heading for the next calculation
        this.lastHeading = heading_deg[heading_deg.length - 1]
        
        return heading_deg;
    }

    /**
     * Calculates the trajectory (x, y) over time given velocity and heading.
     * @param {Array<number>} velocity - Velocity at each time step (m/s).
     * @param {Array<number}> heading_deg - Heading at each time step (degrees).
     * @param {Array<number>} timeStamps - Array of timestamps (seconds).
     * @returns {{x: Array<number>, y: Array<number>}} Object containing arrays for x and y positions.
     */
    getTraj(velocity, heading, timeStamps) {
        let x = [];
        let y = [];
        let dx = this.lastTrajX || 0;
        let dy = this.lastTrajY || 0;
        
        for (let i = 0; i < velocity.length - 1; i++) {
            dx += velocity[i] * Math.cos(heading[i] * Math.PI / 180) * (timeStamps[i + 1] - timeStamps[i]);
            dy += velocity[i] * Math.sin(heading[i] * Math.PI / 180) * (timeStamps[i + 1] - timeStamps[i]);
            x.push(dx);
            y.push(dy);
        }
        this.lastTrajX = dx
        this.lastTrajY = dy

        return { x, y };
    }

    async nateCalculate(timeStamps, gyroDataLeft, gyroDataRight, accelDataLeft, accelDataRight, wheelDiameter = constants.WHEEL_DIAM_IN) {
        const response = await fetch("http://0.0.0.0:8000/calculate/1", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                gyroRight: gyroDataRight,
                gyroLeft: gyroDataLeft,
                timeStamps: timeStamps
            })
        });
        return await response.json();
    }

    resetState() {
        lastDisplacement = null;
        lastHeading = null;
        lastTrajX = null;
        lastTrajY = null;
    }
}


module.exports = new CalculationUtils()