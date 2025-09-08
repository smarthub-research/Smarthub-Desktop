const timeManager = require("../../../services/timeManager");
const constants = require("../../../config/constants");

const { DT, WHEEL_RADIUS_M, DIST_WHEELS_M, DIST_WHEELS_IN} = constants;

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
    displacement = getDisplacement(accelDataLeft, accelDataRight, velocity, displacement);
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

function getDisplacement(accelDataLeft, accelDataRight, velocity, displacement) {
    displacement += velocity * DT;
    return displacement;
}

function getVelocity(gyroDataLeft, gyroDataRight) {
    const avgRotationRate = (gyroDataLeft[0] + gyroDataRight[0]) / 2;
    return avgRotationRate * WHEEL_RADIUS_M;
}


// def get_heading_deg(time_from_start, rot_l, rot_r, diameter=WHEEL_DIAM_IN, dist_wheels=DIST_WHEELS_IN):
//     rot_l = np.array(rot_l) 
//     rot_r = np.array(rot_r)
//     time_from_start = np.array(time_from_start)  # Time (sec)

//     heading_deg = [0]
//     for i in range(len(rot_r) - 1):
//         w = ((rot_r[i]-rot_l[i]) * diameter*IN_TO_M/2) / (dist_wheels*IN_TO_M)
//         dh = w * (time_from_start[i + 1] - time_from_start[i])
//         dh = dh*180/np.pi
//         # Append last change to overall heading angle:
//         heading_deg.append(dh + heading_deg[-1])
//     return heading_deg


function getHeading(time_from_start, gyroDataLeft, gyroDataRight, diameter=WHEEL_DIAM_IN, dist_wheels=DIST_WHEELS_IN) {

    let heading_deg = [0];
    for (let i = 0; i < gyroDataRight.length - 1; i++) {
        // Angular velocity (rotating left is positive)
        let w = ((gyroDataRight[i] - gyroDataLeft[i]) * diameter * IN_TO_M / 2) / (dist_wheels * IN_TO_M);
        // Change in heading angle over time step
        let dt = time_from_start[i + 1] - time_from_start[i];
        let dh = w * dt;
        // Convert to degrees
        dh = dh * 180 / Math.PI;
        // Append last change to overall heading angle
        heading_deg.push(dh + heading_deg[heading_deg.length - 1]);
    }
    return heading_deg;
}

function getTraj(velocity, heading_deg, time_from_start) {
    var x = [];
    var y = [];
    var dx = 0;
    var dy = 0;

    for (let i = 0; i < velocity.length - 1; i++) {
        // Calculate change in time
        var dt = time_from_start[i + 1] - time_from_start[i];
        // Convert heading to radians
        var headingRad = heading_deg[i] * Math.PI / 180;
        // Update dx, dy using velocity and heading
        dx += velocity[i] * Math.cos(headingRad) * dt;
        dy += velocity[i] * Math.sin(headingRad) * dt;
        x.push(dx);
        y.push(dy);
    }

    // Return trajectory as array of [x, y] pairs (optional, or just x/y arrays)
    return {
        x: x,
        y: y,
    };
}

module.exports = {
    decodeSensorData, calc
}