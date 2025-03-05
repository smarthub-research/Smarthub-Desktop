const { ipcMain, BrowserWindow } = require('electron');
const noble = require('@abandonware/noble');

// const deviceUUID = 'a4a0edd55c2224e0bdb692dc2e457cba';
const deviceServiceId = '0000290c00001000800000805f9b34fb';
const deviceName = 'Left Smarthub: 9999';

let connectedPeripheral = null;

ipcMain.handle('connect-ble', async (event, leftDevice, rightDevice) => {
    // await handleConnection(leftDevice);
    // await handleConnection(rightDevice);
    return await handleConnection();
});

ipcMain.handle('begin-reading-data', async () => {
    return await findCharacteristics(true);
});

ipcMain.handle('stop-reading-data', async () => {
    return await findCharacteristics(false)
})

async function handleConnection() {
    return new Promise((resolve, reject) => {
        noble.on('stateChange', async (state) => {
            if (state === 'poweredOn') {
                console.log('Scanning for BLE devices...\n');
                noble.startScanning([], false);
            } else {
                noble.stopScanning();
                reject('Bluetooth not available');
            }
        });

        noble.on('discover', async (peripheral) => {
            const peripheralName = peripheral.advertisement.localName;
            const serviceUuids = peripheral.advertisement.serviceUuids || [];

            if (peripheralName === deviceName && serviceUuids.includes(deviceServiceId)) {
                noble.stopScanning();
                try {
                    await peripheral.connectAsync();
                    connectedPeripheral = peripheral;
                    console.log(`Connected to ${peripheral.advertisement.localName}`);
                    resolve('Connected to BLE Device');
                } catch (err) {
                    reject(err);
                }
            }
        });
    });
}

async function findCharacteristics(isRecording) {
    connectedPeripheral.discoverServices([], (error, services) => {
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

    connectedPeripheral.on('disconnect', () => {
        console.log('Disconnected from device');
        noble.startScanning();
    });
}

function subscribeToCharacteristics(characteristic) {
    // Subscribe to characteristic notifications
    characteristic.subscribe((error) => {
        if (error) {
            console.error('Subscribe error:', error);
            return;
        }
        console.log('Subscribed to notifications');
    });

    // Store the callback so we can remove it later
    characteristic._dataCallback = (data, isNotification) => {
        console.log('Notification received:', data.toString('hex'));
        BrowserWindow.getAllWindows().forEach((win) => {
            win.webContents.send('new-ble-data', data.toString('hex'));
        });
    };

    characteristic.on('data', characteristic._dataCallback);
}

function unsubscribeToCharacteristics(characteristic) {
    // Unsubscribe from notifications
    characteristic.unsubscribe((error) => {
        if (error) {
            console.error('Unsubscribe error:', error);
            return;
        }
        console.log('Unsubscribed from notifications');
    });

    // Remove event listener
    if (characteristic._dataCallback) {
        characteristic.off('data', characteristic._dataCallback);
        delete characteristic._dataCallback;
    }
}