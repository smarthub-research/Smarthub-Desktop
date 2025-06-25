const BrowserWindow = require('electron').BrowserWindow;
const connectionStore = require('../../../services/connectionStore');
const { noble } = require('../../deviceDiscovery');
const timeManager = require('../../../services/timeManager');
const dataBuffer = require('./dataBufferService');
const constants = require('../../../config/constants');
const downsamplingUtils = require('../utils/downsamplingUtils')
const calculationUtils = require("../utils/calculationUtils")

// Global variables for BLE data processing
let pendingLeftData = null;
let pendingRightData = null;
let displacement = 0;

const { TARGET_POINTS, DOWNSAMPLE_TO } = constants;

async function startBleReading() {
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
}

async function stopBleReading() {
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
        let accelData = [];
        let gyroData = [];

        calculationUtils.decodeSensorData(data, accelData, gyroData);

        if (peripheral === connectionStore.getConnectionOne()) {
            // Store data from left device
            pendingLeftData = {
                accelData: accelData,
                gyroData: gyroData
            };
        } else if (peripheral === connectionStore.getConnectionTwo()) {
            // Store data from right device
            pendingRightData = {
                accelData: accelData,
                gyroData: gyroData
            };
        }

        // Only process data when we have both left and right readings
        if (pendingLeftData && pendingRightData) {
            const jsonData = calculationUtils.calc(
                pendingLeftData.accelData,
                pendingRightData.accelData,
                pendingLeftData.gyroData,
                pendingRightData.gyroData,
                displacement
            );

            // Append data to both buffers
            dataBuffer.appendToBuffer(jsonData);
            const buffer = dataBuffer.getDataBuffer()

            // When we have enough data points, downsample and send to frontend
            if (buffer.timeStamp.length >= TARGET_POINTS) {
                const downSampledData = downsamplingUtils.downsampleData(buffer, DOWNSAMPLE_TO);
                // Send downsampled data to frontend
                BrowserWindow.getAllWindows().forEach((win) => {
                    win.webContents.send('new-ble-data', {data: downSampledData});
                });

                // Reset buffer after sending
                dataBuffer.clearBuffers();
            }

            // Clear the pending data after processing
            pendingLeftData = null;
            pendingRightData = null;
        }
    }

    characteristic.on('data', characteristic._dataCallback);
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

module.exports = {
    startBleReading,
    stopBleReading,
    findCharacteristics
};