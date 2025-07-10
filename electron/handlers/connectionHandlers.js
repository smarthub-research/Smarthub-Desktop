const { ipcMain } = require('electron');
const connectionStore = require('../services/connectionStore');

function setupConnectionHandlers() {
    ipcMain.handle('connect-ble', async (event, data) => {
        const device = data.device;
        return await handleConnection(device);
    });

    ipcMain.handle('disconnect-ble', async (event, data) => {
        const device = data.device;

        if (!device || !device.name || !device.UUID) {
            return { success: false, message: "Invalid device data" };
        }

        try {
            await handleDisconnect(device);
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
            connectionStore.setConnectionOne(devicePeripheral);
        } else {
            connectionStore.setConnectionTwo(devicePeripheral);
        }

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

module.exports = {
    setupConnectionHandlers
};