const { ipcMain } = require('electron');
const BrowserWindow = require('electron').BrowserWindow;
const noble = require('@abandonware/noble');
const connectionStore = require('../services/connectionStore');

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
    const uuid = peripheral.uuid;

    if (name) {
        BrowserWindow.getAllWindows().forEach((win) => {
            win.webContents.send('new-device-found', [name, uuid]);
        });
    }
    connectionStore.addNearbyPeripheral(peripheral);
});

// ipc function to begin finding devices
function setupDiscoveryHandlers() {
    ipcMain.handle('search-for-devices', async () => {
        await noble.startScanningAsync([], false);
    });

    ipcMain.handle('get-connected-devices', async () => {
        const conn1 = connectionStore.getConnectionOne();
        const conn2 = connectionStore.getConnectionTwo();

        const devices = [];
        if (conn1) devices.push(conn1.advertisement.localName);
        if (conn2) devices.push(conn2.advertisement.localName);

        console.log('connections', devices);
        return devices;
    });
}

module.exports = {
    setupDiscoveryHandlers,
    noble // export noble for other modules to use
};