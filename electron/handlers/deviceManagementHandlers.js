/*

Establishes entry points for handling anything regarding BLE devices

*/

const { ipcMain } = require('electron');
const deviceManagementService = require('../services/deviceManagementService');

function deviceManagementHandlers() {
    // Returns any connected devices
    ipcMain.handle('get-connected-devices', async () => {
        return deviceManagementService.getConnectedDevices()
    });

    // Activate noble to scan for nearby BLE devices
    ipcMain.handle('search-for-devices', async () => {
        await deviceManagementService.searchForDevices();
    });

    // Connects to a selected BLE device
    ipcMain.handle('connect-ble', async (event, data) => {
        if (data.device) {
            return await deviceManagementService.handleConnection(data.device);
        } 
        else {
            return {error: "Invalid Device"};
        }
    });

    // Disconnects from a selected BLE device
    ipcMain.handle('disconnect-ble', async (event, data) => {
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
    
    // Disconnects from any connected devices
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

    // Checks connection status of connected devices
    ipcMain.handle('check-connection-status', async () => {
        return deviceManagementService.checkConnectionStatus();
    })

    // Creates listeners to watch for dropped connections
    ipcMain.handle('setup-disconnection-listeners', () => {
        deviceManagementService.setupDisconnectionListeners();
    })
}

module.exports = {
    deviceManagementHandlers
}