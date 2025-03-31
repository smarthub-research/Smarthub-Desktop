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
let dataBuffer = [];
let rawDataBuffer = [];

const TARGET_POINTS = 10; // Target number of points to downsample
const DOWNSAMPLE_TO = 3;   // Target number after downsampling

// Constants for calculations
const IN_TO_M = 0.0254;
const WHEEL_DIAM_IN = 24;
const WHEEL_RADIUS_M = (WHEEL_DIAM_IN / 2) * IN_TO_M; // Convert to meters
const DIST_WHEELS_IN = 26;
const DIST_WHEELS_M = DIST_WHEELS_IN * IN_TO_M; // Convert to meters
const DT = 0.05;

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
        // Format test data consistently
        testData = {
            displacement: data.displacement || [],
            velocity: data.velocity || [],
            heading: data.heading || [],
            trajectory: data.trajectory || [],
            duration: calculateDuration(data),
            maxVelocity: calculateMaxVelocity(data.velocity || []),
            avgHeading: calculateAvgHeading(data.heading || [])
        };
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

    ipcMain.handle('download-csv', (event, args) => {
        console.log('Downloading CSV file...');
        const testName = args.testName || 'test_data';
        downloadCsv(testName);
    });

    ipcMain.handle('submit-test-data', (event, metadata) => {
        return supabaseHandlers.submitTestData(metadata, rawDataBuffer);
    });
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
        dataBuffer.push(jsonData);
        rawDataBuffer.push(jsonData);

        // When we have enough data points, downsample and send to frontend
        if (dataBuffer.length >= TARGET_POINTS) {
            const downSampledData = downsampleData(dataBuffer, DOWNSAMPLE_TO);
            // Send downsampled data to frontend
            BrowserWindow.getAllWindows().forEach((win) => {
                win.webContents.send('new-ble-data', {data: downSampledData});
            });

            // Reset buffer after sending
            dataBuffer = [];
        }
    }

    characteristic.on('data', characteristic._dataCallback);
}

function downsampleData(data, targetPoints) {
    if (data.length <= targetPoints) {
        return data; // Not enough data to downsample
    }

    // For 10 points to 3 points using LTTB:
    // 1. Always include first and last points
    // 2. Select one point from the middle that creates largest triangle

    // When specifically downsampling to 3 points:
    if (targetPoints === 3) {
        // First point is always included
        const result = [data[0]];

        // Find the point in the middle that creates the largest triangle with first and last points
        const firstPoint = data[0];
        const lastPoint = data[data.length - 1];

        let maxArea = -1;
        let maxAreaIndex = 1;

        // Check all points between first and last
        for (let i = 1; i < data.length - 1; i++) {
            const currentPoint = data[i];

            // Calculate triangle area using cross product
            const area = Math.abs(
                (firstPoint.timeStamp - lastPoint.timeStamp) *
                (currentPoint.displacement - firstPoint.displacement) -
                (firstPoint.timeStamp - currentPoint.timeStamp) *
                (lastPoint.displacement - firstPoint.displacement)
            );

            if (area > maxArea) {
                maxArea = area;
                maxAreaIndex = i;
            }
        }

        // Add the point that creates largest triangle
        result.push(data[maxAreaIndex]);

        // Add the last point
        result.push(data[data.length - 1]);

        return result;
    }

    // For other target sizes, use the general LTTB algorithm
    const sampled = [data[0]];
    const bucketSize = data.length / (targetPoints - 2);

    for (let i = 0; i < targetPoints - 2; i++) {
        const startIdx = Math.floor((i) * bucketSize) + 1;
        const endIdx = Math.floor((i + 1) * bucketSize) + 1;
        const lastPoint = sampled[sampled.length - 1];
        const nextBucketIndex = Math.min(Math.floor((i + 2) * bucketSize) + 1, data.length - 1);
        const nextPoint = data[nextBucketIndex];
        const maxAreaIndex = getMaxAreaIndex(data, startIdx, endIdx, lastPoint, nextPoint);
        sampled.push(data[maxAreaIndex]);
    }

    if (data.length > 1) {
        sampled.push(data[data.length - 1]);
    }

    return sampled;
}

function getMaxAreaIndex(data, startIdx, endIdx, lastPoint, nextPoint) {
    let maxArea = -1;
    let maxAreaIndex = startIdx;

    for (let j = startIdx; j < endIdx; j++) {
        // Calculate triangle area using cross product
        const currentPoint = data[j];
        const area = Math.abs(
            (lastPoint.timeStamp - nextPoint.timeStamp) *
            (currentPoint.displacement - lastPoint.displacement) -
            (lastPoint.timeStamp - currentPoint.timeStamp) *
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
    const displacement = getDisplacement(accelDataLeft, accelDataRight);

    return {
        displacement: getDisplacement(gyroDataLeft, gyroDataRight),
        velocity: getVelocity(gyroDataLeft, gyroDataRight),
        heading: getHeading(gyroDataLeft, gyroDataRight),
        trajectory: getTraj(velocity, displacement, gyroDataLeft, gyroDataRight),
        timeStamp: timeManager.getRecordingStartTime() ? Date.now() - timeManager.getRecordingStartTime() : null,
    }
}

function getDisplacement(gyroDataLeft, gyroDataRight) {
    // Average rotation rate between left and right wheels (rad/s)
    const avgRotationRate = (gyroDataLeft[0] + gyroDataRight[0]) / 2;

    // Convert rotation rate to linear displacement
    return avgRotationRate * WHEEL_RADIUS_M * DT;
}

function getVelocity(gyroDataLeft, gyroDataRight) {
    // Average the left and right wheel rotation rates
    const avgRotationRate = (gyroDataLeft[0] + gyroDataRight[0]) / 2;

    // Convert rotation rate to linear velocity
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
    console.log('Unsubscribed from notifications');

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

    const csvString = 'Time (sec),Displacement (m),Velocity (m/s),Heading,Trajectory X,Trajectory Y\n' + rawDataBuffer.map(row =>
        `${row.timeStamp / 1000},${row.displacement},${row.velocity},${row.heading},${row.trajectory.x},${row.trajectory.y}`).join('\n');

    const filePath = `${testName}.csv`;
    fs.writeFile(`${testName}.csv`, csvString, (err) => {
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