const { ipcMain } = require('electron');
const connectionStore = require('../services/connectionStore');

function setupConnectionHandlers() {
    ipcMain.handle('connect-ble', async (event, data) => {
        console.log("Received BLE connection request:", data);
        const device = data.device;
        return await handleConnection(device);
    });

    ipcMain.handle('disconnect-ble', async (event, data) => {
        console.log("Received BLE disconnect request:", data);
        const device = data.device;

        if (!device || !device.name || !device.UUID) {
            console.error("Invalid device data:", device);
            return { success: false, message: "Invalid device data" };
        }

        try {
            await handleDisconnect(device);
            console.log('Device disconnected: ', device.name);
            return { success: true, message: 'Device disconnected successfully' };
        } catch (error) {
            console.error('Error disconnecting device:', error);
            return { success: false, message: 'Failed to disconnect device' };
        }
    });

    ipcMain.handle('reset-devices', async () => {
        const conn1 = connectionStore.getConnectionOne();
        const conn2 = connectionStore.getConnectionTwo();

        if (conn1 !== null) {
            await conn1.disconnectAsync();
            connectionStore.setConnectionOne(null);
        }
        if (conn2 !== null) {
            await conn2.disconnectAsync();
            connectionStore.setConnectionTwo(null);
        }
        console.log('Devices disconnected');
    });
}

async function handleConnection(device) {
    try {
        console.log('device ' + device.name);
        const deviceName = device.name;
        const deviceUUID = device.UUID;
        let devicePeripheral = null;

        const nearbyPeripherals = connectionStore.getNearbyPeripherals();
        nearbyPeripherals.forEach((peripheral) => {
            const name = peripheral.advertisement.localName;
            const uuid = peripheral.uuid;

            if ((name === deviceName) || (uuid === deviceUUID)) {
                devicePeripheral = peripheral;
            }
        });

        await devicePeripheral.connectAsync();
        if (connectionStore.getConnectionTwo()) {
            console.log('connected to device two');
            connectionStore.setConnectionOne(devicePeripheral);
        } else {
            console.log('connected to device one');
            connectionStore.setConnectionTwo(devicePeripheral);
        }

        console.log("Device connected: ", device.name);
        return { success: true };
    } catch (error) {
        console.error("Connection failed:", error);
        return { success: false, error: error.message };
    }
}

async function handleDisconnect(device) {
    const conn1 = connectionStore.getConnectionOne();
    const conn2 = connectionStore.getConnectionTwo();

    if (conn1 && (conn1.advertisement.localName === device.name || conn1.uuid === device.UUID)) {
        console.log('Disconnecting from connectionOne:', conn1.advertisement.localName);
        await conn1.disconnectAsync();
        connectionStore.setConnectionOne(null);
    } else if (conn2 && (conn2.advertisement.localName === device.name || conn2.uuid === device.UUID)) {
        console.log('Disconnecting from connectionTwo:', conn2.advertisement.localName);
        await conn2.disconnectAsync();
        connectionStore.setConnectionTwo(null);
    } else {
        console.warn('Device not found in active connections:', device.name);
        throw new Error('Device not found in active connections');
    }
}

module.exports = {
    setupConnectionHandlers
};