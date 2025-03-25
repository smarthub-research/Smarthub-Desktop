const { ipcMain } = require('electron');
const BrowserWindow = require('electron').BrowserWindow;
const connectionStore = require('../services/connectionStore');
const { noble } = require('./deviceDiscovery');

let recordingStartTime = null;
let pausedElapsedTime = 0;
let isRecording = false;
let isPaused = false;

let flags = [];

let testData = null;

function setupDataHandlers() {
    ipcMain.handle('begin-reading-data', async () => {
        noble.stopScanning();

        // If resuming from pause
        if (isPaused) {
            isPaused = false;
            // Adjust the start time to account for the pause duration
            recordingStartTime = Date.now() - pausedElapsedTime;
        } else {
            // Fresh start
            recordingStartTime = Date.now();
            pausedElapsedTime = 0;
        }

        isRecording = true;

        const conn1 = connectionStore.getConnectionOne();
        const conn2 = connectionStore.getConnectionTwo();

        if (conn1 !== null) {
            await findCharacteristics(true, conn1);
        }

        if (conn2 !== null) {
            await findCharacteristics(true, conn2);
        }

        BrowserWindow.getAllWindows().forEach((win) => {
            win.webContents.send('begin-reading', { startTime: recordingStartTime });
        });

        return { success: true, startTime: recordingStartTime };
    });

    ipcMain.handle('stop-reading-data', async () => {
        isRecording = false;
        isPaused = true;

        // Calculate how much time has elapsed up to this pause
        if (recordingStartTime) {
            pausedElapsedTime = Date.now() - recordingStartTime;
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
            win.webContents.send('stop-reading', { elapsedTime: pausedElapsedTime });
        });

        return { success: true, elapsedTime: pausedElapsedTime };
    });

    ipcMain.handle('restart-recording', async () => {
        recordingStartTime = isRecording ? Date.now() : null;
        pausedElapsedTime = 0;
        isPaused = false;

        // Broadcast restart event to all windows with startTime
        console.log('Restarting recording...');
        BrowserWindow.getAllWindows().forEach((win) => {
            win.webContents.send('restart-recording', { startTime: recordingStartTime });
        });
        return { success: true, startTime: recordingStartTime };
    });

    // New handler to get the current recording state
    ipcMain.handle('get-recording-state', () => {
        console.log('Getting recording state...');
        return {
            isRecording,
            isPaused,
            startTime: recordingStartTime,
            elapsedTime: pausedElapsedTime,
        };
    });

    ipcMain.handle('add-flag', (event, { flag }) => {
        // Prevent duplicate flags
        if (!flags.some(f => f.id === flag.id)) {
            flag.timeStamp = recordingStartTime ? Date.now() - recordingStartTime : null;
            flags.push(flag);

            // Broadcast the new flag to all windows
            BrowserWindow.getAllWindows().forEach((win) => {
                win.webContents.send('new-flag', flag);
            });
        }
        return { success: true };
    });

    ipcMain.handle('clear-flags', () => {
        flags = [];
        BrowserWindow.getAllWindows().forEach((win) => {
            win.webContents.send('clear-flags');
        });
        return { success: true };
    });

    ipcMain.handle('get-flags', () => {
        return {
            flags: flags,
            elapsedTime: pausedElapsedTime,
            isRecording: isRecording,
            isPaused: isPaused,
            startTime: recordingStartTime
        };
    });

    ipcMain.handle('end-test', () => {
        console.log('Ending test...');
        BrowserWindow.getAllWindows().forEach((win) => {
            win.webContents.send('test-ended');
        })
    })

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
                    if (shouldRecord) {
                        subscribeToCharacteristics(characteristic);
                    } else {
                        unsubscribeToCharacteristics(characteristic);
                    }
                });
            });
        });
    });
}


function subscribeToCharacteristics(characteristic) {
    characteristic.subscribe((error) => {
        if (error) {
            console.error('Subscribe error:', error);
            return;
        }
        console.log('Subscribed to notifications');
    });

    characteristic._dataCallback = (data) => {
        let accelDataLeft = [];
        let gyroDataLeft = [];

        let accelDataRight = [];
        let gyroDataRight = [];
        decodeSensorData(data, accelDataLeft, gyroDataLeft);
        decodeSensorData(data, accelDataRight, gyroDataRight);

        const jsonData = calc(accelDataLeft, accelDataRight, gyroDataLeft, gyroDataRight);

        BrowserWindow.getAllWindows().forEach((win) => {
            win.webContents.send('new-ble-data', jsonData);
        });
    };

    characteristic.on('data', characteristic._dataCallback);
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
    const velocity = getVelocity(gyroDataLeft, gyroDataRight)
    const displacement = getDisplacement(accelDataLeft, accelDataRight);

    return {
        displacement: getDisplacement(gyroDataLeft, gyroDataRight),
        velocity: getVelocity(gyroDataLeft, gyroDataRight),
        heading: getHeading(gyroDataLeft, gyroDataRight),
        trajectory: getTraj(velocity, displacement, gyroDataLeft, gyroDataRight),
        timeStamp: recordingStartTime ? Date.now() - recordingStartTime : null,
    }
}

const IN_TO_M = 0.0254;
const WHEEL_DIAM_IN = 24;
const WHEEL_RADIUS_M = (WHEEL_DIAM_IN / 2) * IN_TO_M; // Convert to meters
const DIST_WHEELS_IN = 26;
const DIST_WHEELS_M = DIST_WHEELS_IN * IN_TO_M; // Convert to meters

const DT = 0.05;

function getDisplacement(gyroDataLeft, gyroDataRight) {
    // Calculate displacement from wheel rotation data
    // Gyro data represents rotation rate, so we need to integrate to get displacement

    // Average rotation rate between left and right wheels (rad/s)
    const avgRotationRate = (gyroDataLeft[0] + gyroDataRight[0]) / 2;

    // Convert rotation rate to linear displacement
    // displacement = rotation rate * wheel radius * time delta
    return avgRotationRate * WHEEL_RADIUS_M * DT;
}

function getDistance(gyroDataLeft, gyroDataRight) {
    // Calculate cumulative distance traveled
    // Here we'll return the instantaneous distance increment
    // The UI will need to accumulate these values

    // Use absolute values to ensure distance always increases regardless of direction
    const leftWheelDistance = Math.abs(gyroDataLeft[0]) * WHEEL_RADIUS_M * DT;
    const rightWheelDistance = Math.abs(gyroDataRight[0]) * WHEEL_RADIUS_M * DT;

    // Average of the two wheels gives us the distance traveled
    return (leftWheelDistance + rightWheelDistance) / 2;
}

function getVelocity(gyroDataLeft, gyroDataRight) {
    // Calculate velocity directly from rotation rate
    // velocity = rotation rate * wheel radius

    // Average the left and right wheel rotation rates
    const avgRotationRate = (gyroDataLeft[0] + gyroDataRight[0]) / 2;

    // Convert rotation rate to linear velocity
    return avgRotationRate * WHEEL_RADIUS_M;
}

function getHeading(gyroDataLeft, gyroDataRight) {
    // Calculate heading change from differential wheel rotation
    // Positive heading indicates turning right, negative indicates turning left

    // Calculate difference in wheel rotation rates
    const rotationDifference = gyroDataRight[0] - gyroDataLeft[0];

    // Convert rotation difference to angular velocity (rad/s)
    // Angular velocity = (right wheel rate - left wheel rate) * wheel radius / wheel base width
    const angularVelocity = rotationDifference * WHEEL_RADIUS_M / DIST_WHEELS_M;

    // Angular change in this time step (in radians)
    const headingChange = angularVelocity * DT;

    // Convert to degrees for easier visualization
    return headingChange * (180 / Math.PI);
}

function getTraj(velocity, displacement, gyroDataLeft, gyroDataRight) {
    // Calculate trajectory coordinates (x, y) based on velocity and heading
    // This function should return an object with x and y properties

    // Calculate heading change for this time step
    const headingChange = getHeading(gyroDataLeft, gyroDataRight);

    // Convert heading to radians for trigonometric calculations
    const headingRad = headingChange * (Math.PI / 180);

    // Calculate x and y components of motion
    // For small time steps, we can approximate the trajectory as straight lines
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
            return;
        }
        console.log('Unsubscribed from notifications');
    });

    if (characteristic._dataCallback) {
        characteristic.off('data', characteristic._dataCallback);
        delete characteristic._dataCallback;
    }
}



module.exports = {
    setupDataHandlers
};