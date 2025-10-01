const constants = require("../../../config/constants");
const calibration = require("../../../services/calibrationService");

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
function decodeSensorData(data, accelData, gyroData) {
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

let lastDisplacement = null
let lastHeading = null
let lastTrajX = null
let lastTrajY = null

/**
 * Main calculation function to compute velocity, displacement, heading, and trajectory.
 * @param {Array<number>} time_from_start - Array of timestamps (seconds).
 * @param {Array<number>} gyroDataLeft - Left wheel gyroscope data (rps).
 * @param {Array<number>} gyroDataRight - Right wheel gyroscope data (rps).
 * @param {Array<number>} accelDataLeft - Left wheel acceleration data.
 * @param {Array<number>} accelDataRight - Right wheel acceleration data.
 * @param {number} [wheelDiameter=constants.WHEEL_DIAM_IN] - Wheel diameter (inches).
 * @returns {Object} Calculation results including velocity, displacement, heading, trajectory, and timestamp.
 */
function calc(time_from_start, gyroDataLeft, gyroDataRight, accelDataLeft, accelDataRight, wheelDiameter = constants.WHEEL_DIAM_IN) {
    const velocity = getVelocity(gyroDataLeft, gyroDataRight, wheelDiameter);
    const displacement = getDisplacement(time_from_start, gyroDataLeft, gyroDataRight, wheelDiameter);
    const heading = getHeading(time_from_start, gyroDataLeft, gyroDataRight, wheelDiameter);
    const traj = getTraj(velocity, heading, time_from_start);
    return {
        gyro_left: gyroDataLeft,
        gyro_right: gyroDataRight,
        accel_left: accelDataLeft,
        accel_right: accelDataRight,
        displacement: displacement.slice(1),
        velocity: velocity.slice(1),
        heading: heading.slice(1),
        trajectory_y: traj.y.slice(1),
        trajectory_x: traj.x.slice(1),
        timeStamp: time_from_start.slice(1)
    };
}

/**
 * Calculates displacement (meters) at each time step.
 * @param {Array<number>} time_from_start - Array of timestamps (seconds).
 * @param {Array<number>} rot_l - Left wheel rotation rates (rps).
 * @param {Array<number>} rot_r - Right wheel rotation rates (rps).
 * @param {number} [diameter=constants.WHEEL_DIAM_IN] - Wheel diameter (inches).
 * @returns {Array<number>} Displacement at each time step (meters).
 */
function getDisplacement(time_from_start, rot_l, rot_r, diameter = constants.WHEEL_DIAM_IN) {
    const IN_TO_M = constants.IN_TO_M || 0.0254;
    
    for (let i = 0; i < rot_l.length; i++) {
        rot_l[i] = Math.abs(rot_l[i]);
        rot_r[i] = Math.abs(rot_r[i]);
    }

    // Initialize with the last displacement value or 0 if this is the first calculation
    let dist_m = [lastDisplacement || 0];

    // Calculate displacement using wheel circumference and average rotation rate
    for (let i = 0; i < rot_r.length - 1; i++) {
        const dx_r = (rot_l[i]+rot_r[i])/2 * (time_from_start[i + 1] - time_from_start[i]);
        const dx_m = dx_r * (diameter * IN_TO_M / 2);
        dist_m.push(dx_m + dist_m[dist_m.length - 1]);
    }

    // Update the last displacement for the next calculation
    lastDisplacement = dist_m[dist_m.length - 1];

    return dist_m;
}

/**
 * Calculates velocity (m/s) at each time step.
 * @param {Array<number>} rot_l - Left wheel rotation rates (rad/s).
 * @param {Array<number>} rot_r - Right wheel rotation rates (rad/s).
 * @param {number} [diameter=constants.WHEEL_DIAM_IN] - Wheel diameter (inches).
 * @returns {Array<number>} Velocity at each time step (m/s).
 */
function getVelocity(rot_l, rot_r, diameter = constants.WHEEL_DIAM_IN) {
    const IN_TO_M = constants.IN_TO_M || 0.0254;
    let vel_ms = [0];
    for (let i = 0; i < rot_r.length - 1; i++) {
        const v_r = rot_r[i] * diameter / 2 * IN_TO_M;
        const v_l = rot_l[i] * diameter / 2 * IN_TO_M;
        const v_curr = (v_r + v_l) / 2;
        vel_ms.push(v_curr);
    }
    return vel_ms;
}

/**
 * Calculates heading (degrees) at each time step.
 * @param {Array<number>} time_from_start - Array of timestamps (seconds).
 * @param {Array<number>} rot_l - Left wheel rotation rates (rps).
 * @param {Array<number>} rot_r - Right wheel rotation rates (rps).
 * @param {number} [diameter=constants.WHEEL_DIAM_IN] - Wheel diameter (inches).
 * @returns {Array<number>} Heading at each time step (degrees).
 */
function getHeading(time_from_start, rot_l, rot_r, diameter = constants.WHEEL_DIAM_IN) {
    // Initialize with the last heading value or 0 if this is the first calculation
    let heading_deg = [lastHeading || 0];
    const wheelDistance = calibration.calibration.wheel_distance || constants.DIST_WHEELS_IN;
    for (let i = 0; i < rot_r.length - 1; i++) {
        // Left is positive right is negative
        const w = ((rot_r[i] - rot_l[i]) * diameter * constants.IN_TO_M / 2) / (wheelDistance * constants.IN_TO_M);
        const dt = time_from_start[i + 1] - time_from_start[i];
        let dh = w * dt;
        dh = dh * 180 / Math.PI;
        heading_deg.push(dh + heading_deg[heading_deg.length - 1]);
    }
    
    // Update the last heading for the next calculation
    lastHeading = heading_deg[heading_deg.length - 1];
    
    return heading_deg;
}

/**
 * Calculates the trajectory (x, y) over time given velocity and heading.
 * @param {Array<number>} velocity - Velocity at each time step (m/s).
 * @param {Array<number>} heading_deg - Heading at each time step (degrees).
 * @param {Array<number>} time_from_start - Array of timestamps (seconds).
 * @returns {{x: Array<number>, y: Array<number>}} Object containing arrays for x and y positions.
 */
function getTraj(velocity, heading_deg, time_from_start) {
    // Initialize with the last trajectory positions or 0 if this is the first calculation
    let x = [lastTrajX || 0];
    let y = [lastTrajY || 0];
    for (let i = 0; i < velocity.length - 1; i++) {
        const dt = time_from_start[i + 1] - time_from_start[i];
        const headingRad = heading_deg[i] * Math.PI / 180;
        const dx = velocity[i] * Math.cos(headingRad) * dt;
        const dy = velocity[i] * Math.sin(headingRad) * dt;
        x.push(x[x.length - 1] + dx);
        y.push(y[y.length - 1] + dy);
    }
    
    // Update the last trajectory positions for the next calculation
    lastTrajX = x[x.length - 1];
    lastTrajY = y[y.length - 1];
    
    return { x, y };
}

function resetState() {
    lastDisplacement = null;
    lastHeading = null;
    lastTrajX = null;
    lastTrajY = null;
}

module.exports = {
    decodeSensorData,
    calc,
    getDisplacement,
    getVelocity,
    getHeading,
    getTraj,
    lastDisplacement,
    lastHeading,
    lastTrajX,
    lastTrajY,
    resetState
};