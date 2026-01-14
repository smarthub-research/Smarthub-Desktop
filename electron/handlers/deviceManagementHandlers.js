/**
 * Device management IPC handlers.
 *
 * Exposes BLE device actions to the renderer: searching, connecting,
 * disconnecting and querying connected devices. Calls are delegated to
 * `deviceManagementService` which contains the BLE/Noble logic.
 */

const { ipcMain } = require('electron');
const deviceManagementService = require('../services/deviceManagementService');

function deviceManagementHandlers() {
    // Return list of currently connected devices
    ipcMain.handle('get-connected-devices', async () => {
        return deviceManagementService.getConnectedDevices()
    });

    // Start BLE scanning (Noble)
    ipcMain.handle('search-for-devices', async () => {
        await deviceManagementService.searchForDevices();
    });

    // Connect to a specific device (expects { device })
    ipcMain.handle('connect-ble', async (_, data) => {
        if (data.device) {
            return await deviceManagementService.handleConnection(data.device);
        } else {
            return { error: "Invalid Device" };
        }
    });

    // Disconnect a provided device; validates payload and returns status
    ipcMain.handle('disconnect-ble', async (_, data) => {
        const device = data.device;
        if (!device || !device.name || !device.UUID) {
            return { success: false, message: "Invalid device data" };
        }
        try {
            await deviceManagementService.handleDisconnect(device);
            return { success: true, message: 'Device disconnected successfully' };
        } catch (error) {
            console.error('Error disconnecting device:', error);
            return { success: false, message: 'Failed to disconnect device' };
        }
    });

    // Force disconnect any connected devices (uses service to fetch connections)
    ipcMain.handle('reset-devices', async () => {
        const devices = deviceManagementService.getConnectedDevices();
        if (devices[0] !== null) {
            await deviceManagementService.handleDisconnect(devices[0])
        }
        if (devices[1] !== null) {
            await deviceManagementService.handleDisconnect(devices[1])
        }
        console.log('All devices disconnected');
    });

    // Return connection status for connected devices
    ipcMain.handle('check-connection-status', async () => {
        return deviceManagementService.checkConnectionStatus();
    })

    // Setup background listeners for dropped connections
    ipcMain.handle('setup-disconnection-listeners', () => {
        deviceManagementService.setupDisconnectionListeners();
    })
}

module.exports = {
    deviceManagementHandlers
}