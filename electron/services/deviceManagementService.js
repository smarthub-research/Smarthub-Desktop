/**
 * Device management service.
 *
 * Handles BLE discovery, connection, and disconnection logic using Noble.
 * Also notifies renderer windows about discovered devices and disconnection
 * events. Uses `connectionStore` to track active/nearby peripherals.
 */

const noble = require("@abandonware/noble")
const { BrowserWindow } = require('electron');
const connectionStore = require('../utils/connectionStore');
const dataService = require('./dataService');

// Ensure Noble starts/stops scanning based on adapter state
noble.on('stateChange', (state) => {
    if (state === 'poweredOn') {
        noble.startScanning([], false);
    } else {
        noble.stopScanning();
    }
});

// Broadcast discovered SmartHub devices to renderer windows
noble.on("discover", (peripheral) => {
    try {
        const name = peripheral.advertisement?.localName;
        const uuid = peripheral.uuid;

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

class DeviceManagementService {
    // Start scanning for nearby devices and clear previous nearby cache
    async searchForDevices() {
        try {
            connectionStore.clearNearbyPeripherals();
            await noble.stopScanningAsync();
            await noble.startScanningAsync([], false);
            return { success: true };
        } catch (error) {
            console.error('Error starting device scan:', error);
            return { success: false, error: error.message };
        }
    }

    // Return minimal info for connected devices for frontend display
    getConnectedDevices() {
        const conn1 = connectionStore.getConnectionOne();
        const conn2 = connectionStore.getConnectionTwo();

        const devices = [];
        if (conn1) devices.push({name: conn1.advertisement.localName, UUID: conn1.uuid});
        if (conn2) devices.push({name: conn2.advertisement.localName, UUID: conn2.uuid});
        return devices;
    }

    // Connect to a previously discovered nearby peripheral
    async handleConnection(device) {
        try {
            const deviceName = device.name;
            const deviceUUID = device.UUID;
            let devicePeripheral = null;

            const nearbyPeripherals = connectionStore.getNearbyPeripherals();
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

            if (connectionStore.getConnectionOne() === null) {
                connectionStore.setConnectionOne(devicePeripheral);
            } else if (connectionStore.getConnectionTwo() === null) {
                connectionStore.setConnectionTwo(devicePeripheral);
            } else {
                await devicePeripheral.disconnectAsync();
                return { success: false, error: "Maximum number of connections reached" };
            }

            // Trigger background Kafka initialization when first device connects
            dataService.initializeKafka().catch(error => {
                console.error('Background Kafka initialization failed:', error);
            });

            return { success: true };
        } catch (error) {
            console.error("Connection failed:", error);
            return { success: false, error: error.message };
        }
    }

    // Disconnect a connected peripheral and clear the corresponding slot
    async handleDisconnect(device) {
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

    isDeviceConnected(peripheral) {
        if (!peripheral) return false;
        return peripheral.state === 'connected';
    }

    // Return boolean connection status for both connection slots
    checkConnectionStatus() {
        const conn1 = connectionStore.getConnectionOne();
        const conn2 = connectionStore.getConnectionTwo();

        const isConn1Connected = conn1 ? this.isDeviceConnected(conn1) : false;
        const isConn2Connected = conn2 ? this.isDeviceConnected(conn2) : false;

        return {
            deviceOne: isConn1Connected,
            deviceTwo: isConn2Connected
        };
    }

    // Attach listeners to active connections to notify frontend on disconnect
    setupDisconnectionListeners() {
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
}

module.exports = new DeviceManagementService();