/*

Performs the business logic of the device management process

*/

const noble = require("@abandonware/noble")
const { BrowserWindow } = require('electron');
const connectionStore = require('./connectionStore');

// Ensure only one listener is set for state changes
noble.on('stateChange', (state) => {
    if (state === 'poweredOn') {
        noble.startScanning([], false);
    } else {
        noble.stopScanning();
    }
});

// Global discover event to broadcast discovered devices
noble.on("discover", (peripheral) => {
    try {
        const name = peripheral.advertisement?.localName;
        const uuid = peripheral.uuid;

        // Only broadcast if it's a SmartHub device
        if (name && name.toLowerCase().includes("smarthub")) {
            connectionStore.addNearbyPeripheral(peripheral);
            const windows = BrowserWindow.getAllWindows();
            windows.forEach((win) => {
                if (win && !win.isDestroyed()) {
                    win.webContents.send('new-device-found', {name: name, UUID: uuid});
                }
            });
        }
    } catch (error) {
        console.error('Error in device discovery:', error);
    }
});

// Begins searching for nearby devices and triggers the on discover callback
async function searchForDevices() {
    try {
        // Clear old nearby peripherals to prevent memory buildup
        connectionStore.clearNearbyPeripherals();
        
        // Stop scanning first to reset
        await noble.stopScanningAsync();
        
        // Start scanning for all devices (empty array means scan for all)
        await noble.startScanningAsync([], false);
        
        return { success: true };
    } catch (error) {
        console.error('Error starting device scan:', error);
        return { success: false, error: error.message };
    }
}

// Returns an array of both connected devices. Used for front end
// If looking for connected devices in backend use connectionStore
function getConnectedDevices() {
    // Fetch both connections
    const conn1 = connectionStore.getConnectionOne();
    const conn2 = connectionStore.getConnectionTwo();

    const devices = [];

    // Check if devices exist then extract info
    if (conn1) {
        const nameOne = conn1.advertisement.localName;
        const uuidOne = conn1.uuid;

        devices.push({name: nameOne, UUID: uuidOne});
    }
    if (conn2) {
        const nameTwo = conn2.advertisement.localName;
        const uuidTwo = conn2.uuid;

        devices.push({name: nameTwo, UUID: uuidTwo});
    }

    return devices;
}

// Given a device, establishes BLE connection
async function handleConnection(device) {
    try {
        const deviceName = device.name;
        const deviceUUID = device.UUID;
        let devicePeripheral = null;

        const nearbyPeripherals = connectionStore.getNearbyPeripherals();
        
        // Find the exact peripheral within nearby
        // This ensures the device is still within range
        nearbyPeripherals.forEach((peripheral) => {
            const name = peripheral.advertisement?.localName;
            const uuid = peripheral.uuid;

            if ((name === deviceName) || (uuid === deviceUUID)) {
                devicePeripheral = peripheral;
            }
        });

        if (!devicePeripheral) {
            throw new Error(`Device not found in nearby peripherals: ${deviceName}`);
        }

        await devicePeripheral.connectAsync();
        
        // Connect devices and assign to connections
        if (connectionStore.getConnectionOne() === null) {
            connectionStore.setConnectionOne(devicePeripheral);
        } else if (connectionStore.getConnectionTwo() === null) {
            connectionStore.setConnectionTwo(devicePeripheral);
        } else {
            // Both slots are occupied, disconnect the device
            await devicePeripheral.disconnectAsync();
            return { success: false, error: "Maximum number of connections reached" };
        }

        return { success: true };
    } catch (error) {
        console.error("Connection failed:", error);
        return { success: false, error: error.message };
    }
}

// Given a device, disconnects from the BLE connection
async function handleDisconnect(device) {
    // Get both connections
    const conn1 = connectionStore.getConnectionOne();
    const conn2 = connectionStore.getConnectionTwo();

    // Check which device we are trying to disconnect from
    if (conn1 && (conn1.advertisement.localName === device.name || conn1.uuid === device.UUID)) {
        await conn1.disconnectAsync();
        connectionStore.setConnectionOne(null);
    } else if (conn2 && (conn2.advertisement.localName === device.name || conn2.uuid === device.UUID)) {
        await conn2.disconnectAsync();
        connectionStore.setConnectionTwo(null);
    } else {
        console.warn('Device not found in active connections:', device.name);
        throw new Error('Device not found in active connections');
    }
}

// Helper to check connection state
function isDeviceConnected(peripheral) {
    if (!peripheral) return false;
    return peripheral.state === 'connected';
}

// Gets the connection state and returns to front end
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

// Used for listener to ensure connections aren't dropped
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

module.exports = {
    getConnectedDevices,
    searchForDevices,
    handleConnection,
    handleDisconnect,
    checkConnectionStatus,
    setupDisconnectionListeners,
    noble
}