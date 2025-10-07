
function formatDataForCSV(data) {
    // Initialize CSV string
    let csvString = '';

    // Add header row
    csvString += 'Time(s),Displacement,Velocity,Heading,Trajectory_X,Trajectory_Y,';
    csvString += 'Gyro_Left_1,Gyro_Left_2,Gyro_Left_3,Gyro_Left_4,';
    csvString += 'Gyro_Right_1,Gyro_Right_2,Gyro_Right_3,Gyro_Right_4,';
    csvString += 'Accel_Left_1,Accel_Left_2,Accel_Left_3,Accel_Left_4,';
    csvString += 'Accel_Right_1,Accel_Right_2,Accel_Right_3,Accel_Right_4\n';

    // Add data rows
    data.timeStamp.forEach((time, i) => {
        let row = `${time / 1000},${data.displacement[i]?.displacement || data.displacement[i]},`;
        row += `${data.velocity[i]?.velocity || data.velocity[i]},`;
        row += `${data.heading[i]?.heading || data.heading[i]},`;
        row += `${data.trajectory_x[i]},${data.trajectory_y[i]},`;

        // Add each value from the arrays individually
        const gyroLeft = data.gyro_left[i] || [0,0,0,0];
        for (let j = 0; j < 4; j++) {
            row += `${gyroLeft[j] || 0},`;
        }

        const gyroRight = data.gyro_right[i] || [0,0,0,0];
        for (let j = 0; j < 4; j++) {
            row += `${gyroRight[j] || 0},`;
        }

        const accelLeft = data.accel_left[i] || [0,0,0,0];
        for (let j = 0; j < 4; j++) {
            row += `${accelLeft[j] || 0},`;
        }

        const accelRight = data.accel_right[i] || [0,0,0,0];
        for (let j = 0; j < 4; j++) {
            row += `${accelRight[j] || 0}${j < 3 ? ',' : ''}`;
        }

        csvString += row + '\n';
    });

    return csvString;
}

// Helper method to get app paths
function getAppPath(type) {
    const { app } = require('electron');
    return app.getPath(type);
}

module.exports = {
    formatDataForCSV,
    getAppPath
}