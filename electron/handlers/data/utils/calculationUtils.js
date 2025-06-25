const timeManager = require("../../../services/timeManager");
const constants = require("../../../config/constants");

const { DT, WHEEL_RADIUS_M, DIST_WHEELS_M} = constants;

function decodeSensorData(data, accelData, gyroData) {
    for (let i = 0; i < 4; i++) {
        accelData.push((data[2 * i + 2] + data[2 * i + 3] * 256) / 1000);
        gyroData.push((data[2 * i + 10] + data[2 * i + 11] * 256) / 100);

        if ((data[0] && (1 << i)) === (1 << i)) {
            accelData[i] *= -1;
        }

        if ((data[1] && (1 << i)) === (1 << i)) {
            gyroData[i] *= -1;
        }
    }
}

function calc(accelDataLeft, accelDataRight, gyroDataLeft, gyroDataRight, displacement) {
    const velocity = getVelocity(gyroDataLeft, gyroDataRight);
    displacement = getDisplacement(accelDataLeft, accelDataRight, velocity);
    const trajectory_y = getTraj(velocity, displacement, gyroDataLeft, gyroDataRight).y;
    const trajectory_x = getTraj(velocity, displacement, gyroDataLeft, gyroDataRight).x;

    return {
        gyro_left: gyroDataLeft,
        gyro_right: gyroDataRight,
        accel_left: accelDataLeft,
        accel_right: accelDataRight,
        displacement: displacement,
        velocity: velocity,
        heading: getHeading(gyroDataLeft, gyroDataRight),
        trajectory_y: trajectory_y,
        trajectory_x: trajectory_x,
        timeStamp: timeManager.getRecordingStartTime() ? Date.now() - timeManager.getRecordingStartTime() : null,
    }
}

function getDisplacement(accelDataLeft, accelDataRight, velocity) {
    displacement += velocity * DT;
    return displacement;
}

function getVelocity(gyroDataLeft, gyroDataRight) {
    const avgRotationRate = (gyroDataLeft[0] + gyroDataRight[0]) / 2;
    return avgRotationRate * WHEEL_RADIUS_M;
}

function getHeading(gyroDataLeft, gyroDataRight) {
    // Calculate difference in wheel rotation rates
    const rotationDifference = gyroDataRight[0] - gyroDataLeft[0];

    // Convert rotation difference to angular velocity (rad/s)
    const angularVelocity = rotationDifference * WHEEL_RADIUS_M / DIST_WHEELS_M;

    // Angular change in this time step (in radians)
    const headingChange = angularVelocity * DT;

    // Convert to degrees for easier visualization
    return headingChange * (180 / Math.PI);
}

function getTraj(velocity, displacement, gyroDataLeft, gyroDataRight) {
    // Calculate heading change for this time step
    const headingChange = getHeading(gyroDataLeft, gyroDataRight);

    // Convert heading to radians for trigonometric calculations
    const headingRad = headingChange * (Math.PI / 180);

    // Calculate x and y components of motion
    const x = velocity * Math.cos(headingRad) * DT;
    const y = velocity * Math.sin(headingRad) * DT;

    return {
        x: x,
        y: y
    };
}

module.exports = {
    decodeSensorData, calc
}