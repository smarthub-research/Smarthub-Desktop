const noble = require("@abandonware/noble")
const BrowserWindow = require('electron').BrowserWindow;
const timeManager = require("../utils/timeManager")
const connectionStore = require('../utils/connectionStore')
const dataBuffer = require('../utils/dataBuffer');
const calculationUtils = require("../utils/calculationUtils")

class DataService {
    constructor() {
        this.pendingLeftData = null;
        this.pendingRightData = null;
        this.THRESHOLD = 0.03;
    }

    async beginReadingData() {
        noble.stopScanning();

        timeManager.beginRecording();

        const conn1 = connectionStore.getConnectionOne();
        const conn2 = connectionStore.getConnectionTwo();

        await this.findCharacteristics(true, conn1);
        await this.findCharacteristics(true, conn2);

        BrowserWindow.getAllWindows().forEach((win) => {
            win.webContents.send('begin-reading', { startTime: timeManager.getRecordingStartTime() });
        });
    }

    async stopReadingData() {
        timeManager.stopRecording();

        const conn1 = connectionStore.getConnectionOne();
        const conn2 = connectionStore.getConnectionTwo();

        await this.findCharacteristics(false, conn1);
        await this.findCharacteristics(false, conn2);

        BrowserWindow.getAllWindows().forEach((win) => {
            win.webContents.send('stop-reading', { elapsedTime: timeManager.getPausedElapsedTime() });
        });
    }

    async findCharacteristics(shouldRecord, peripheral) {
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
                    // Find characteristic and subscribe or unsubscribe
                    const targetCharacteristic = characteristics.find(characteristic => characteristic.uuid === "2a56");
                    if (targetCharacteristic) {
                        if (shouldRecord) {
                            this.subscribeToCharacteristics(targetCharacteristic, peripheral);
                        } else {
                            this.unsubscribeToCharacteristics(targetCharacteristic);
                        }
                    }
                });
            })
        })
    }

    unsubscribeToCharacteristics(characteristic) {
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

    subscribeToCharacteristics(characteristic, peripheral) {
        characteristic.subscribe((error) => {
            if (error) {
                console.error('Subscribe error:', error);
            }
        });

        characteristic._dataCallback = async (data) => {
            let accelData = [];
            let gyroData = [];
            calculationUtils.decodeSensorData(data, accelData, gyroData);
            this.storePacket(peripheral, accelData, gyroData);
            if (this.pendingLeftData && this.pendingRightData) {
                this.processPackets();   
            }
        }

        characteristic.on('data', characteristic._dataCallback);
    }

    storePacket(peripheral, accelData, gyroData) {
        if (peripheral === connectionStore.getConnectionOne()) {
            // Store data from left device
            this.pendingLeftData = {
                accelData: accelData,
                gyroData: gyroData,
            };
        } else if (peripheral === connectionStore.getConnectionTwo()) {
            // Store data from right device
            this.pendingRightData = {
                accelData: accelData,
                gyroData: gyroData,
            };
        }
    }

    processPackets() {
        let time_curr = (Date.now() - timeManager.getRecordingStartTime()) / 1000
        let timeStamps = []
        // Creates 4 time stamps at sensor intervals
        for (let i = 3; i > -1; i--) {
            timeStamps.push(time_curr - i * (1/68))
        }
        
        // // Use configurable calculation method
        const smoothedData = this.smoothData(this.pendingRightData, this.pendingLeftData, timeStamps)
        this.pendingLeftData.gyroData = smoothedData.gyroLeft_smoothed;
        this.pendingRightData.gyroData = smoothedData.gyroRight_smoothed;

        this.applyGain(this.pendingLeftData.gyroData, this.pendingRightData.gyroData)
        this.applyThreshold(this.pendingLeftData.gyroData, this.pendingRightData.gyroData)

        let calculationData = calculationUtils.calc(timeStamps, this.pendingLeftData.gyroData, this.pendingRightData.gyroData, this.pendingLeftData.accelData, this.pendingRightData.accelData);

        // Append data to both buffers
        dataBuffer.appendToBuffer(calculationData);
        
        // reformat data for our graphs
        let finalData = this.processData(calculationData);

        // Send downsampled data to frontend
        BrowserWindow.getAllWindows().forEach((win) => {
            if (win && !win.isDestroyed()) {
                win.webContents.send('new-ble-data', {data: finalData});
            }
        });

        // Clear the pending data after processing
        this.pendingLeftData = null;
        this.pendingRightData = null;
    }

    async smoothData(pendingRightData, pendingLeftData, timeStamps) {
        const response = await fetch("http://localhost:8000/calibrate/smooth", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                gyroRight: pendingRightData.gyroData,
                gyroLeft: pendingLeftData.gyroData,
                timeStamps: timeStamps
            })
        });
        return await response.json();
    }

    // Both data comes in the form of {
    //  accelData:
    //  gyroData:
    // }
    applyGain(gyroLeft, gyroRight) {
        for (let i = 0; i < gyroLeft.length; i++) {
            gyroLeft[i] *= 1.13;
            gyroRight[i] *= 1.12;
        }
        return {
            "left": gyroLeft,
            "right": gyroRight
        }
    }

    // Both data comes in the form of {
    //  accelData:
    //  gyroData:
    // }
    applyThreshold(gyroLeft, gyroRight) {
        for (let i = 0; i < gyroLeft.length; i++) {
            gyroLeft[i] = (Math.abs(gyroLeft[i]) > this.THRESHOLD ? gyroLeft[i] : 0) 
            gyroRight[i] = (Math.abs(gyroRight[i]) > this.THRESHOLD ? gyroRight[i] : 0)
        }
    }

    processData(data) {
        let returnData = {
            displacement: [],
            heading: [],
            velocity: [],
            trajectory: [],
            gyroLeft: [],
            gyroRight: [],
            timeStamp: []
        };
        for (let i = 0; i < data.timeStamp.length; i++) {
            returnData.displacement.push({
                time: data.timeStamp[i],
                displacement: data.displacement[i]
            })
            returnData.heading.push({
                time: data.timeStamp[i],
                heading: data.heading[i],
            });
            returnData.velocity.push({
                time: data.timeStamp[i],
                velocity: data.velocity[i],
            });
            returnData.trajectory.push({
                trajectory_x: data.trajectory_x[i],
                trajectory_y: data.trajectory_y[i],
            });
        }
        returnData.gyroLeft.push(data.gyroLeft);
        returnData.gyroRight.push(data.gyroRight);
        returnData.timeStamp.push(data.timeStamp);
        return returnData;
    }
}

module.exports = new DataService();