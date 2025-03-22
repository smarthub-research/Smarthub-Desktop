const { ipcMain } = require('electron');
const BrowserWindow = require('electron').BrowserWindow;
const connectionStore = require('../services/connectionStore');
const { noble } = require('./deviceDiscovery');

let recordingStartTime = null;
let pausedElapsedTime = 0;
let isRecording = false;
let isPaused = false;

let flags = [];

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
            flags.push(flag);

            // Broadcast the new flag to all windows
            BrowserWindow.getAllWindows().forEach((win) => {
                win.webContents.send('new-flag', flag);
            });
        }
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

function decodeSensorData(data) {
    let accelData = [];
    let gyroData = [];

    console.log(data);

    for (let i = 0; i < 4; i++) {
        accelData.push((data[2*i+2] + data[2*i+3]*256) / 1000);
        gyroData.push((data[2*i+10] + data[2*i+11]*256) / 100);

        if ((data[0] && (1 << i)) === (1 << i)) {
            accelData[i] *= -1;
        }

        if ((data[1] && (1 << i)) === (1 << i)) {
            gyroData[i] *= -1;
        }
    }

    const decodeData = {
        accel1: accelData[0],
        accel2: accelData[1],
        accel3: accelData[2],
        accel4: accelData[3],
        gyro1: gyroData[0],
        gyro2: gyroData[1],
        gyro3: gyroData[2],
        gyro4: gyroData[3],
        timeStamp: recordingStartTime ? Date.now() - recordingStartTime : null,
    };

    console.log(JSON.stringify(decodeData, null, 2));
    return decodeData;
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
        const jsonData = decodeSensorData(data);

        BrowserWindow.getAllWindows().forEach((win) => {
            win.webContents.send('new-ble-data', jsonData);
        });
    };

    characteristic.on('data', characteristic._dataCallback);
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