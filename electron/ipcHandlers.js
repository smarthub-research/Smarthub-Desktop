const { ipcMain } = require('electron');
const BrowserWindow = require('electron').BrowserWindow;
const noble = require('@abandonware/noble');

const deviceServiceId = '0000290c00001000800000805f9b34fb';
const deviceName = 'Left Smarthub: 9999';

let connectionOne = null;
let connectionTwo = null;

let nearbyPeripherals = [];


ipcMain.handle('search-for-devices', async () => {
    await noble.startScanningAsync([], false);
});

// Ensure only one listener is set for state changes
noble.on('stateChange', (state) => {
    if (state === 'poweredOn') {
        console.log('Scanning for BLE devices...\n');
        noble.startScanning([], false);
    } else {
        noble.stopScanning();
    }
});

// Global discover event to broadcast discovered devices
noble.on("discover", (peripheral) => {
    const name = peripheral.advertisement.localName;
    const uuid = peripheral.uuid

    if (name) {
        BrowserWindow.getAllWindows().forEach((win) => {
            win.webContents.send('new-device-found', [name, uuid]);
        });
    }
    nearbyPeripherals.push(peripheral);
});



ipcMain.handle('connect-ble', async (event, data) => {
    console.log("Received BLE connection request:", data);

    const device = data.device;

    return await handleConnection(device);
    // return await debugConnection();
});

// Improved Connection Handling
async function handleConnection(device) {
    try {

        console.log('device ' + device[0])

        const deviceName = device[0];
        const deviceUUID = device[1];

        let devicePeripheral = null;
        nearbyPeripherals.forEach((peripheral) => {
            let name = peripheral.advertisement.localName;
            let uuid = peripheral.uuid;
            if ((name === deviceName) || (uuid === deviceUUID)) {
                devicePeripheral = peripheral;
            }
        })

        await devicePeripheral.connectAsync();

        if (connectionOne) {
            console.log('connected to device two');
            connectionTwo = devicePeripheral;
        } else {
            console.log('connected to device one');
            connectionOne = devicePeripheral;
        }

        console.log("Device connected: ", device[0]);

        return { success: true };
    } catch (error) {
        console.error("Connection failed:", error);
        return { success: false, error: error.message };
    }
}

ipcMain.handle('disconnect-ble', async (event, data) => {
    console.log("Received BLE disconnect request:", data);
    const device = data.device;

    // Make sure the device exists and contains the necessary information
    if (!device || !device[0] || !device[1]) {
        console.error("Invalid device data:", device);
        return { success: false, message: "Invalid device data" };
    }

    try {
        const result = await handleDisconnect(device);
        console.log('Device disconnected: ', device[0]);
        return { success: true, message: 'Device disconnected successfully' };
    } catch (error) {
        console.error('Error disconnecting device:', error);
        return { success: false, message: 'Failed to disconnect device' };
    }
});


async function handleDisconnect(device) {
    // Check if either of the connections match the device
    if (connectionOne && connectionOne.advertisement.localName === device[0]
        || connectionOne.uuid === device[1]) {
        console.log('Disconnecting from connectionOne:', connectionOne.advertisement.localName);
        await connectionOne.disconnectAsync();
    } else if (connectionTwo && connectionTwo.advertisement.localName === device[0]
        || connectionTwo.uuid === device[1]) {
        console.log('Disconnecting from connectionTwo:', connectionTwo.advertisement.localName);
        await connectionTwo.disconnectAsync();
    } else {
        console.warn('Device not found in active connections:', device[0]);
        throw new Error('Device not found in active connections');
    }
}

// Handle Reading & Unsubscribing from Characteristics
ipcMain.handle('begin-reading-data', async () => {
    noble.stopScanning();

    await findCharacteristics(true, rightConnection);
    await findCharacteristics(true, leftConnection);
});

ipcMain.handle('stop-reading-data', async () => {
    await findCharacteristics(false, rightConnection);
    await findCharacteristics(false, leftConnection);
});

async function findCharacteristics(isRecording, peripheral) {
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
                    if (isRecording) {
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
        console.log('Notification received:', data.toString('hex'));
        BrowserWindow.getAllWindows().forEach((win) => {
            win.webContents.send('new-ble-data', data.toString('hex'));
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
