const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    searchForDevices: () => ipcRenderer.invoke('search-for-devices'),
    onDeviceDiscovery: (callback) => ipcRenderer.on('new-device-found', (event, device) => callback(device)),

    beginReadingData: () => ipcRenderer.invoke('begin-reading-data'),
    stopRecordingData: () => ipcRenderer.invoke('stop-reading-data'),
    onBLEData: (callback) => ipcRenderer.on('new-ble-data', (event, data) => callback(data)),
    connectBle: (device) => ipcRenderer.invoke('connect-ble', { device }),
    disconnectBle: (device) => ipcRenderer.invoke('disconnect-ble', { device }),
});
