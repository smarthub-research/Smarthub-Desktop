const BrowserWindow = require('electron').BrowserWindow;
const connectionStore = require('../../../services/connectionStore');
const dataBuffer = require('./dataBufferService');
const constants = require('../../../config/constants');
const downsamplingUtils = require('../utils/downsamplingUtils')
const calculationUtils = require("../utils/calculationUtils")

// Global variables for BLE data processing
let pendingLeftData = null;
let pendingRightData = null;
let displacement = 0;

const { TARGET_POINTS, DOWNSAMPLE_TO } = constants;

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
            // or we send on the first point received.
            if (buffer.timeStamp.length >= TARGET_POINTS || dataBuffer.rawBuffer.length === 1) {
                const downSampledData = downsamplingUtils.downsampleData(buffer, DOWNSAMPLE_TO);

                // reformat data for our graphs
                let finalData = processData(downSampledData);
                dataBuffer.clearBuffers();

                // Send downsampled data to frontend
                BrowserWindow.getAllWindows().forEach((win) => {
                    if (win && !win.isDestroyed()) {
                        win.webContents.send('new-ble-data', {data: finalData});
                    }
                });
                // Reset buffer after sending
            }

            // Clear the pending data after processing
            pendingLeftData = null;
            pendingRightData = null;
        }
    }

    characteristic.on('data', characteristic._dataCallback);
}

function processData(data) {
    let returnData = {
        displacement: [],
        heading: [],
        velocity: [],
        trajectory: [],
        gyro_left: [],
        gyro_right: [],
        timeStamp: []
    }
    data.map((item) => {
        returnData.displacement.push({
            time: item.timeStamp,
            displacement: item.displacement,
        })
        returnData.heading.push({
            time: item.timeStamp,
            heading: item.heading,
        })
        returnData.velocity.push({
            time: item.timeStamp,
            velocity: item.velocity,
        })
        returnData.trajectory.push({
            time: item.timeStamp,
            trajectory_x: item.trajectory_x,
            trajectory_y: item.trajectory_y,
        })
        returnData.gyro_left.push(...item.gyro_left)
        returnData.gyro_right.push(...item.gyro_right)    
        returnData.timeStamp.push(item.timeStamp)
    })
    return returnData
}

function isDeviceConnected(peripheral) {
    if (!peripheral) return false;
    return peripheral.state === 'connected';
}

function checkConnectionStatus() {
    const conn1 = connectionStore.getConnectionOne();
    const conn2 = connectionStore.getConnectionTwo();

    const isConn1Connected = conn1 ? isDeviceConnected(conn1) : false;
    const isConn2Connected = conn2 ? isDeviceConnected(conn2) : false;

    return {
        deviceOne: isConn1Connected,
        deviceTwo: isConn2Connected
    };
}

function setupDisconnectionListeners() {
    const conn1 = connectionStore.getConnectionOne();
    const conn2 = connectionStore.getConnectionTwo();

    if (conn1) {
        conn1.on('disconnect', () => {
            BrowserWindow.getAllWindows().forEach((win) => {
                win.webContents.send('device-disconnected', { device: 'one' });
            });
        });
    }

    if (conn2) {
        conn2.on('disconnect', () => {
            BrowserWindow.getAllWindows().forEach((win) => {
                win.webContents.send('device-disconnected', { device: 'two' });
            });
        });
    }
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
    checkConnectionStatus,
    setupDisconnectionListeners,
    findCharacteristics
};