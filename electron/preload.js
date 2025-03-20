const { contextBridge, ipcRenderer } = require('electron');

// This is our Electron 'API' where we create our endpoints
contextBridge.exposeInMainWorld('electronAPI', {
    searchForDevices: () => ipcRenderer.invoke('search-for-devices'),

    // on functions are for when we need to receive streams of data
    onDeviceDiscovery: (callback) => ipcRenderer.on('new-device-found', (event, device) => callback(device)),

    // all data related functions
    beginReadingData: () => ipcRenderer.invoke('begin-reading-data'),
    stopRecordingData: () => ipcRenderer.invoke('stop-reading-data'),
    onBLEData: (callback) => ipcRenderer.on('new-ble-data', (event, data) => callback(data)),
    connectBle: (device) => ipcRenderer.invoke('connect-ble', { device }),
    disconnectBle: (device) => ipcRenderer.invoke('disconnect-ble', { device }),
});
