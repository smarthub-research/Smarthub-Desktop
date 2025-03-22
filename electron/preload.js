const { contextBridge, ipcRenderer } = require('electron');

// This is our Electron 'API' where we create our endpoints
contextBridge.exposeInMainWorld('electronAPI', {

    // Device management functions
    getConnectedDevices: () => ipcRenderer.invoke('get-connected-devices'),
    onDeviceDiscovery: (callback) => ipcRenderer.on('new-device-found', (event, device) => callback(device)),
    searchForDevices: () => ipcRenderer.invoke('search-for-devices'),

    // Connection functions
    connectBle: (device) => ipcRenderer.invoke('connect-ble', { device }),
    disconnectBle: (device) => ipcRenderer.invoke('disconnect-ble', { device }),
    resetDevices: () => ipcRenderer.invoke('reset-devices'),

    // Data functions
    beginReadingData: () => ipcRenderer.invoke('begin-reading-data'),
    stopRecordingData: () => ipcRenderer.invoke('stop-reading-data'),
    onBeginReading: (callback) => {
        ipcRenderer.on('begin-reading', (_, data) => callback(data));
    },
    onStopReading: (callback) => {
        ipcRenderer.on('stop-reading', () => callback());
    },
    onBLEData: (callback) => ipcRenderer.on('new-ble-data', (event, data) => callback(data)),

    addFlag: (flag) => ipcRenderer.invoke('add-flag', { flag }),
    getFlags: () => ipcRenderer.invoke('get-flags'),
    onNewFlag: (callback) => ipcRenderer.on('new-flag', (_, flag) => callback(flag)),

    restartRecording: () => ipcRenderer.invoke('restart-recording'),
    getRecordingState: () => ipcRenderer.invoke('get-recording-state'),
    onRestartRecording: (callback) => {ipcRenderer.on('restart-recording', (_, data) => callback(data));},
});
