const { ipcMain } = require('electron');
const BrowserWindow = require('electron').BrowserWindow;
const noble = require('@abandonware/noble');

// Saved data for the left smarthub device i was given
const deviceServiceId = '0000290c00001000800000805f9b34fb';
const deviceName = 'Left Smarthub: 9999';

// Global variables for the connections because multiple functions use these
let connectionOne = null;
let connectionTwo = null;

// list of near devices
let nearbyPeripherals = [];

// ipc function to begin finding devices and adding to nearbyPeripherals array
ipcMain.handle('search-for-devices', async () => {
    // pass empty array, and say false to disable duplicates
    await noble.startScanningAsync([], false);
});

// Ensure only one listener is set for state changes
noble.on('stateChange', (state) => {
    // This begins scanning once we have setStartScanningAsync because of the state change
    if (state === 'poweredOn') {
        console.log('Scanning for BLE devices...\n');
        noble.startScanning([], false);
    } else {
        // this really never gets triggered but just in case
        noble.stopScanning();
    }
});

// Global discover event to broadcast discovered devices
noble.on("discover", (peripheral) => {
    // peripheral data
    const name = peripheral.advertisement.localName;
    const uuid = peripheral.uuid

    // we need to make sure this is a viable device so we just check the name
    if (name) {
        // send this content to all windows in the front end with a name uuid tuple
        BrowserWindow.getAllWindows().forEach((win) => {
            win.webContents.send('new-device-found', [name, uuid]);
        });
    }
    // add this to the nearby array for when we try to connect to a device later
    nearbyPeripherals.push(peripheral);
});


// IPC to connect us to the given device
ipcMain.handle('connect-ble', async (event, data) => {
    // IPC handles data through JSON so if you read this function in preload.js
    // you will see there is a device arg but it bundles them for us so we need to unwrap
    console.log("Received BLE connection request:", data);

    // the device to be connected to
    const device = data.device;

    return await handleConnection(device);
});

// Connection Handling
async function handleConnection(device) {
    try {
        //debugging
        console.log('device ' + device[0])

        // given devices name and uuid
        const deviceName = device[0];
        const deviceUUID = device[1];

        // var for the peripheral that we need
        let devicePeripheral = null;

        // iterate through nearbyPeripherals till we find the one we want to connect to
        nearbyPeripherals.forEach((peripheral) => {
            // get basic data of the peripheral
            let name = peripheral.advertisement.localName;
            let uuid = peripheral.uuid;

            // check if they match
            if ((name === deviceName) || (uuid === deviceUUID)) {
                // if they do we want to save this peripheral
                devicePeripheral = peripheral;
            }
        })

        // now we connect to the saved peripheral
        await devicePeripheral.connectAsync();

        // if we are already connected to a device we need to make sure we don't overwrite that
        if (connectionOne) {
            console.log('connected to device two');
            connectionTwo = devicePeripheral;
        } else {
            console.log('connected to device one');
            connectionOne = devicePeripheral;
        }

        // more debugging
        console.log("Device connected: ", device[0]);

        // promise return
        return { success: true };
    } catch (error) {
        // usually happens when we get out of range of the peripheral
        console.error("Connection failed:", error);
        return { success: false, error: error.message };
    }
}

// Disconnecting Handler
ipcMain.handle('disconnect-ble', async (event, data) => {
    console.log("Received BLE disconnect request:", data);
    const device = data.device;

    // Make sure the device exists and contains the necessary information
    if (!device || !device[0] || !device[1]) {
        console.error("Invalid device data:", device);
        return { success: false, message: "Invalid device data" };
    }

    try {
        // no idea why i said this function returns something
        const result = await handleDisconnect(device);

        // debugging and promise return
        console.log('Device disconnected: ', device[0]);
        return { success: true, message: 'Device disconnected successfully' };
    } catch (error) {
        console.error('Error disconnecting device:', error);
        return { success: false, message: 'Failed to disconnect device' };
    }
});


async function handleDisconnect(device) {
    // Check if either of the connections match the device and if they do we just disconnect
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

    if (connectionOne !== null) {
        await findCharacteristics(true, connectionOne);
    }

    if (connectionTwo !== null) {
        await findCharacteristics(true, connectionTwo);
    }
});

// stops sending data to the browser windows
ipcMain.handle('stop-reading-data', async () => {
    if (connectionOne !== null) {
        await findCharacteristics(false, connectionOne);
    }
    if (connectionTwo !== null) {
        await findCharacteristics(false, connectionTwo);
    }
});

// this function handles subscribing and unsubscribing from peripherals
async function findCharacteristics(isRecording, peripheral) {
    // find its services
    peripheral.discoverServices([], (error, services) => {
        if (error) {
            console.error(error);
            return;
        }

        // go through each service to get characteristics
        services.forEach(service => {
            service.discoverCharacteristics([], (error, characteristics) => {
                if (error) {
                    console.error(error);
                    return;
                }

                // we subscribe to all characteristics cuz why not or we unsubscribe, that's cool too
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

// This function handles the actual subscribing and sending of data to the windows
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

        // ADD DECODE FUNCTION HERE
        // send data.toString('hex') as argument and get back a decoded array
        // maybe something like const decoded = decodeData(data.toString('hex));

        BrowserWindow.getAllWindows().forEach((win) => {
            // After the decode is written you can replace data.toString('hex') with the array or json data
            // Put console.log functions since the front end may not handle json data correctly
            // or you can try to change line 53 in app/devPage.js to
            //
            // <li className={'p-2'} key={index}>{JSON.stringify(item)}</li>
            //
            win.webContents.send('new-ble-data', data.toString('hex'));
        });
    };

    characteristic.on('data', characteristic._dataCallback);
}

// this function unsubscribes from all and stops sending data to windows
function unsubscribeToCharacteristics(characteristic) {
    characteristic.unsubscribe((error) => {
        if (error) {
            console.error('Unsubscribe error:', error);
            return;
        }
        console.log('Unsubscribed from notifications');
    });

    // disables the callback so no more data
    if (characteristic._dataCallback) {
        characteristic.off('data', characteristic._dataCallback);
        delete characteristic._dataCallback;
    }
}
