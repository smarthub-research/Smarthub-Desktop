const { ipcMain } = require('electron');
const BrowserWindow = require('electron').BrowserWindow;
const connectionStore = require('../services/connectionStore');
const { noble } = require('./deviceDiscovery');
const timeManager = require('../services/timeManager');
const flagHandlers = require('./flagHandlers');
const fs = require('fs');
const { shell } = require('electron');
const supabaseHandlers = require('./supabaseHandlers');

let testData = null;
let reviewData = null;
let dataBuffer = initializeBuffer();
let rawDataBuffer = initializeBuffer();

// Constants for downsampling
const TARGET_POINTS = 10; // Target number of points to downsample
const DOWNSAMPLE_TO = 3;   // Target number after downsampling

// Constants for calculations
const IN_TO_M = 0.0254;
const WHEEL_DIAM_IN = 24;
const WHEEL_RADIUS_M = (WHEEL_DIAM_IN / 2) * IN_TO_M; // Convert to meters
const DIST_WHEELS_IN = 26;
const DIST_WHEELS_M = DIST_WHEELS_IN * IN_TO_M; // Convert to meters
const DT = 0.058;

let displacement = 0;

function setupDataHandlers() {
    flagHandlers.setupFlagHandlers();

    setupRecordingHandlers();
    setupTestDataHandlers();
}

function setupRecordingHandlers() {
    ipcMain.handle('begin-reading-data', async () => {
        noble.stopScanning();

        // If resuming from pause
        if (timeManager.isPaused()) {
            timeManager.setIsPaused(false);
            // Adjust the start time to account for the pause duration
            timeManager.setRecordingStartTime(Date.now() - timeManager.getPausedElapsedTime());
        } else {
            // Fresh start
            timeManager.setRecordingStartTime(Date.now());
            timeManager.setPausedElapsedTime(0);
        }

        timeManager.setIsRecording(true);

        const conn1 = connectionStore.getConnectionOne();
        const conn2 = connectionStore.getConnectionTwo();

        if (conn1 !== null) {
            await findCharacteristics(true, conn1);
        }

        if (conn2 !== null) {
            await findCharacteristics(true, conn2);
        }

        BrowserWindow.getAllWindows().forEach((win) => {
            win.webContents.send('begin-reading', { startTime: timeManager.getRecordingStartTime() });
        });

        return { success: true, startTime: timeManager.getRecordingStartTime() };
    });

    ipcMain.handle('stop-reading-data', async () => {
        timeManager.setIsRecording(false);
        timeManager.setIsPaused(true);

        // Calculate how much time has elapsed up to this pause
        if (timeManager.getRecordingStartTime()) {
            timeManager.setPausedElapsedTime(Date.now() - timeManager.getRecordingStartTime());
        }

        const conn1 = connectionStore.getConnectionOne();
        const conn2 = connectionStore.getConnectionTwo();

        if (conn1 !== null) {
            await findCharacteristics(false, conn1);
        }
        if (conn2 !== null) {
            await findCharacteristics(false, conn2);
        }

        BrowserWindow.getAllWindows().forEach((win) => {
            win.webContents.send('stop-reading', { elapsedTime: timeManager.getPausedElapsedTime() });
        });

        return { success: true, elapsedTime: timeManager.getPausedElapsedTime() };
    });

    ipcMain.handle('restart-recording', async () => {
        timeManager.setRecordingStartTime(timeManager.isRecording() ? Date.now() : null);
        displacement = 0;
        timeManager.setPausedElapsedTime(0);
        timeManager.setIsPaused(false);
        flagHandlers.clearFlags();

        // Broadcast restart event to all windows with startTime
        console.log('Restarting recording...');
        BrowserWindow.getAllWindows().forEach((win) => {
            win.webContents.send('restart-recording', { startTime: timeManager.getRecordingStartTime() });
        });
        return { success: true, startTime: timeManager.getRecordingStartTime() };
    });

    ipcMain.handle('get-recording-state', () => {
        console.log('Getting recording state...');
        return {
            isRecording: timeManager.isRecording(),
            isPaused: timeManager.isPaused(),
            startTime: timeManager.getRecordingStartTime(),
            elapsedTime: timeManager.getPausedElapsedTime(),
        };
    });

    ipcMain.handle('end-test', () => {
        console.log('Ending test...');
        BrowserWindow.getAllWindows().forEach((win) => {
            win.webContents.send('test-ended');
        });
    });
}

function setupTestDataHandlers() {
    ipcMain.handle('set-test-data', (event, data) => {
        let dataValues;
        if (!data) {
            dataValues = rawDataBuffer;
        } else {
            dataValues = data;
        }
        console.log("setting test data");

        testData = {
            gyro_left: dataValues.gyro_left || [],
            gyro_right: dataValues.gyro_right || [],
            accel_left: dataValues.accel_left || [],
            accel_right: dataValues.accel_right || [],
            displacement: dataValues.displacement || [],
            velocity: dataValues.velocity || [],
            heading: dataValues.heading || [],
            trajectory_x: dataValues.trajectory_x || [],
            trajectory_y: dataValues.trajectory_y || [],
            timeStamp: dataValues.timeStamp || [],
            duration: calculateDuration(dataValues),
            maxVelocity: calculateMaxVelocity(dataValues.velocity || []),
            avgHeading: calculateAvgHeading(dataValues.heading || [])
        };

        console.log(testData)

        // Clear the data buffers
        dataBuffer = initializeBuffer();
        rawDataBuffer = initializeBuffer();
        return { success: true };
    });

    ipcMain.handle('get-test-data', () => {
        if (!testData) {
            console.log("No test data available");
            return null;
        }

        console.log("Returning test data");
        return testData;
    });

    ipcMain.handle('set-review-data', (event, data) => {
        reviewData = data;
    })

    ipcMain.handle('get-review-data', () => {
        if (!reviewData) {
            console.log("No review data available");
            return null;
        }

        console.log("Returning review data");
        return reviewData;
    })

    ipcMain.handle('download-csv', (event, args) => {
        console.log('Downloading CSV file...');
        const testName = args.testName || 'test_data';
        downloadCsv(testName);
    });

    ipcMain.handle('submit-test-data', (event, metadata) => {
        return supabaseHandlers.submitTestData(metadata, rawDataBuffer);
    });

    ipcMain.handle('fetch-test-files', async () => {
        return await supabaseHandlers.fetchTestFiles();
    })

    ipcMain.handle('update-test-name', async (event, id, testName) => {
        return await supabaseHandlers.updateTestName(id, testName);
    })
}

function calculateDuration(data) {
    const timeData = data.displacement || data;
    if (!timeData || timeData.length === 0) return 0;

    // Find the last timestamp
    const lastItem = timeData[timeData.length - 1];
    return lastItem.timeStamp ? (lastItem.timeStamp / 1000).toFixed(1) : 0;
}

function calculateMaxVelocity(velocityData) {
    if (!velocityData || velocityData.length === 0) return 0;

    return Math.max(...velocityData.map(item => Math.abs(item.velocity || 0)));
}

function calculateAvgHeading(headingData) {
    if (!headingData || headingData.length === 0) return 0;

    const sum = headingData.reduce((acc, item) => acc + (item.heading || 0), 0);
    return sum / headingData.length;
}

async function findCharacteristics(shouldRecord, peripheral) {
    peripheral.discoverServices([], (error, services) => {
        if (error) {
            console.error(error);
            return;
        }

        services.forEach(service => {
            service.discoverCharacteristics([], (error, characteristics) => {
                if (error) {
                    console.error(error);
                    return;
                }

                characteristics.forEach(characteristic => {
                    if (characteristic.uuid === "2a56") {
                        if (shouldRecord) {
                            subscribeToCharacteristics(characteristic, peripheral);
                        } else {
                            unsubscribeToCharacteristics(characteristic);
                        }
                    }
                });
            });
        });
    });
}

function subscribeToCharacteristics(characteristic, peripheral) {
    characteristic.subscribe((error) => {
        if (error) {
            console.error('Subscribe error:', error);
        }
    });

    characteristic._dataCallback = (data) => {
        let accelDataLeft = [];
        let gyroDataLeft = [];
        let accelDataRight = [];
        let gyroDataRight = [];

        decodeSensorData(data, accelDataLeft, gyroDataLeft);
        decodeSensorData(data, accelDataRight, gyroDataRight);

        const jsonData = calc(accelDataLeft, accelDataRight, gyroDataLeft, gyroDataRight);
        appendToBuffer(dataBuffer, jsonData);
        appendToBuffer(rawDataBuffer, jsonData);

        // When we have enough data points, downsample and send to frontend
        if (dataBuffer.timeStamp.length >= TARGET_POINTS) {
            const downSampledData = downsampleData(dataBuffer, DOWNSAMPLE_TO);
            // Send downsampled data to frontend
            BrowserWindow.getAllWindows().forEach((win) => {
                win.webContents.send('new-ble-data', {data: downSampledData});
            });

            // Reset buffer after sending
            dataBuffer = initializeBuffer();
        }
    }

    characteristic.on('data', characteristic._dataCallback);
}

function initializeBuffer() {
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
   }
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
function appendToBuffer(buffer, data) {
    buffer.gyro_left.push(data.gyro_left)
    buffer.gyro_right.push(data.gyro_right)
    buffer.accel_left.push(data.accel_left)
    buffer.accel_right.push(data.accel_right)
    buffer.displacement.push(data.displacement)
    buffer.velocity.push(data.velocity)
    buffer.heading.push(data.heading)
    buffer.trajectory_x.push(data.trajectory_x)
    buffer.trajectory_y.push(data.trajectory_y)
    buffer.timeStamp.push(data.timeStamp)
}


/**
 * Downsample data using Largest Triangle Three Buckets (LTTB) algorithm.
 * Works with a buffer object that has arrays of values.
 *
 * @param {Object} buffer - Buffer containing arrays of data values
 * @param {number} targetPoints - Target number of points after downsampling
 * @returns {Array} - Array of downsampled data points
 */
function downsampleData(buffer, targetPoints) {
    const dataLength = buffer.timeStamp.length;
    if (dataLength <= targetPoints) {
        // Not enough data to downsample, return data as is but in proper format
        const result = [];
        for (let i = 0; i < dataLength; i++) {
            result.push({
                gyro_left: buffer.gyro_left[i],
                gyro_right: buffer.gyro_right[i],
                accel_left: buffer.accel_left[i],
                accel_right: buffer.accel_right[i],
                displacement: buffer.displacement[i],
                velocity: buffer.velocity[i],
                heading: buffer.heading[i],
                trajectory_x: buffer.trajectory_x[i],
                trajectory_y: buffer.trajectory_y[i],
                timeStamp: buffer.timeStamp[i]
            });
        }
        return result;
    }

    // When specifically downsampling to 3 points:
    if (targetPoints === 3) {
        // First point is always included
        const result = [{
            gyro_left: buffer.gyro_left[0],
            gyro_right: buffer.gyro_right[0],
            accel_left: buffer.accel_left[0],
            accel_right: buffer.accel_right[0],
            displacement: buffer.displacement[0],
            velocity: buffer.velocity[0],
            heading: buffer.heading[0],
            trajectory_x: buffer.trajectory_x[0],
            trajectory_y: buffer.trajectory_y[0],
            timeStamp: buffer.timeStamp[0]
        }];

        // Find the point in the middle that creates the largest triangle with first and last points
        const firstTimeStamp = buffer.timeStamp[0];
        const lastTimeStamp = buffer.timeStamp[dataLength - 1];
        const firstDisplacement = buffer.displacement[0];
        const lastDisplacement = buffer.displacement[dataLength - 1];

        let maxArea = -1;
        let maxAreaIndex = 1;

        // Check all points between first and last
        for (let i = 1; i < dataLength - 1; i++) {
            const currentTimeStamp = buffer.timeStamp[i];
            const currentDisplacement = buffer.displacement[i];

            // Calculate triangle area using cross product
            const area = Math.abs(
                (firstTimeStamp - lastTimeStamp) *
                (currentDisplacement - firstDisplacement) -
                (firstTimeStamp - currentTimeStamp) *
                (lastDisplacement - firstDisplacement)
            );

            if (area > maxArea) {
                maxArea = area;
                maxAreaIndex = i;
            }
        }

        // Add the point that creates largest triangle
        result.push({
            gyro_left: buffer.gyro_left[maxAreaIndex],
            gyro_right: buffer.gyro_right[maxAreaIndex],
            accel_left: buffer.accel_left[maxAreaIndex],
            accel_right: buffer.accel_right[maxAreaIndex],
            displacement: buffer.displacement[maxAreaIndex],
            velocity: buffer.velocity[maxAreaIndex],
            heading: buffer.heading[maxAreaIndex],
            trajectory_x: buffer.trajectory_x[maxAreaIndex],
            trajectory_y: buffer.trajectory_y[maxAreaIndex],
            timeStamp: buffer.timeStamp[maxAreaIndex]
        });

        // Add the last point
        result.push({
            gyro_left: buffer.gyro_left[dataLength - 1],
            gyro_right: buffer.gyro_right[dataLength - 1],
            accel_left: buffer.accel_left[dataLength - 1],
            accel_right: buffer.accel_right[dataLength - 1],
            displacement: buffer.displacement[dataLength - 1],
            velocity: buffer.velocity[dataLength - 1],
            heading: buffer.heading[dataLength - 1],
            trajectory_x: buffer.trajectory_x[dataLength - 1],
            trajectory_y: buffer.trajectory_y[dataLength - 1],
            timeStamp: buffer.timeStamp[dataLength - 1]
        });

        return result;
    }

    // For other target sizes, use the general LTTB algorithm
    const sampled = [{
        gyro_left: buffer.gyro_left[0],
        gyro_right: buffer.gyro_right[0],
        accel_left: buffer.accel_left[0],
        accel_right: buffer.accel_right[0],
        displacement: buffer.displacement[0],
        velocity: buffer.velocity[0],
        heading: buffer.heading[0],
        trajectory_x: buffer.trajectory_x[0],
        trajectory_y: buffer.trajectory_y[0],
        timeStamp: buffer.timeStamp[0]
    }];

    const bucketSize = dataLength / (targetPoints - 2);

    for (let i = 0; i < targetPoints - 2; i++) {
        const startIdx = Math.floor((i) * bucketSize) + 1;
        const endIdx = Math.floor((i + 1) * bucketSize) + 1;
        const lastPoint = sampled[sampled.length - 1];
        const nextBucketIndex = Math.min(Math.floor((i + 2) * bucketSize) + 1, dataLength - 1);

        const nextPoint = {
            displacement: buffer.displacement[nextBucketIndex],
            timeStamp: buffer.timeStamp[nextBucketIndex]
        };

        const maxAreaIndex = getMaxAreaIndex(buffer, startIdx, endIdx, lastPoint, nextPoint);

        sampled.push({
            gyro_left: buffer.gyro_left[maxAreaIndex],
            gyro_right: buffer.gyro_right[maxAreaIndex],
            accel_left: buffer.accel_left[maxAreaIndex],
            accel_right: buffer.accel_right[maxAreaIndex],
            displacement: buffer.displacement[maxAreaIndex],
            velocity: buffer.velocity[maxAreaIndex],
            heading: buffer.heading[maxAreaIndex],
            trajectory_x: buffer.trajectory_x[maxAreaIndex],
            trajectory_y: buffer.trajectory_y[maxAreaIndex],
            timeStamp: buffer.timeStamp[maxAreaIndex]
        });
    }

    if (dataLength > 1) {
        sampled.push({
            gyro_left: buffer.gyro_left[dataLength - 1],
            gyro_right: buffer.gyro_right[dataLength - 1],
            accel_left: buffer.accel_left[dataLength - 1],
            accel_right: buffer.accel_right[dataLength - 1],
            displacement: buffer.displacement[dataLength - 1],
            velocity: buffer.velocity[dataLength - 1],
            heading: buffer.heading[dataLength - 1],
            trajectory_x: buffer.trajectory_x[dataLength - 1],
            trajectory_y: buffer.trajectory_y[dataLength - 1],
            timeStamp: buffer.timeStamp[dataLength - 1]
        });
    }

    return sampled;
}

function getMaxAreaIndex(buffer, startIdx, endIdx, lastPoint, nextPoint) {
    let maxArea = -1;
    let maxAreaIndex = startIdx;

    for (let j = startIdx; j < endIdx; j++) {
        // Calculate triangle area using cross product
        const currentTimeStamp = buffer.timeStamp[j];
        const currentDisplacement = buffer.displacement[j];

        const area = Math.abs(
            (lastPoint.timeStamp - nextPoint.timeStamp) *
            (currentDisplacement - lastPoint.displacement) -
            (lastPoint.timeStamp - currentTimeStamp) *
            (nextPoint.displacement - lastPoint.displacement)
        );

        if (area > maxArea) {
            maxArea = area;
            maxAreaIndex = j;
        }
    }

    return maxAreaIndex;
}

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


function calc(accelDataLeft, accelDataRight, gyroDataLeft, gyroDataRight) {
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

function unsubscribeToCharacteristics(characteristic) {
    characteristic.unsubscribe((error) => {
        if (error) {
            console.error('Unsubscribe error:', error);
        }
    });

    if (characteristic._dataCallback) {
        characteristic.off('data', characteristic._dataCallback);
        delete characteristic._dataCallback;
    }
}

function downloadCsv(testName) {
    console.log('Downloading CSV file...');

    // Create CSV header
    let csvString = 'Time (sec),Displacement (m),Velocity (m/s),Heading,Trajectory X,Trajectory Y,';

    // Add headers for each component of arrays
    csvString += 'Gyro_Left_1,Gyro_Left_2,Gyro_Left_3,Gyro_Left_4,';
    csvString += 'Gyro_Right_1,Gyro_Right_2,Gyro_Right_3,Gyro_Right_4,';
    csvString += 'Accel_Left_1,Accel_Left_2,Accel_Left_3,Accel_Left_4,';
    csvString += 'Accel_Right_1,Accel_Right_2,Accel_Right_3,Accel_Right_4\n';

    // Add data rows
    testData.timeStamp.forEach((time, i) => {
        let row = `${time / 1000},${testData.displacement[i]?.displacement || testData.displacement[i]},`;
        row += `${testData.velocity[i]?.velocity || testData.velocity[i]},`;
        row += `${testData.heading[i]?.heading || testData.heading[i]},`;
        row += `${testData.trajectory_x[i]},${testData.trajectory_y[i]},`;

        // Add each value from the arrays individually
        const gyroLeft = testData.gyro_left[i] || [0,0,0,0];
        for (let j = 0; j < 4; j++) {
            row += `${gyroLeft[j] || 0},`;
        }

        const gyroRight = testData.gyro_right[i] || [0,0,0,0];
        for (let j = 0; j < 4; j++) {
            row += `${gyroRight[j] || 0},`;
        }

        const accelLeft = testData.accel_left[i] || [0,0,0,0];
        for (let j = 0; j < 4; j++) {
            row += `${accelLeft[j] || 0},`;
        }

        const accelRight = testData.accel_right[i] || [0,0,0,0];
        for (let j = 0; j < 4; j++) {
            row += `${accelRight[j] || 0}${j < 3 ? ',' : ''}`;
        }

        csvString += row + '\n';
    });

    const filePath = `${testName}.csv`;
    fs.writeFile(filePath, csvString, (err) => {
        if (err) {
            console.error('Error writing CSV file:', err);
            return;
        }
        console.log('CSV file saved successfully');
        shell.openPath(filePath);
    });
}

module.exports = {
    setupDataHandlers
};