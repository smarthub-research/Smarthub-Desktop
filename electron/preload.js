const { contextBridge, ipcRenderer } = require('electron');

// This is our Electron 'API' where we create our endpoints
contextBridge.exposeInMainWorld('electronAPI', {

    // Device management functions
    getConnectedDevices: () => ipcRenderer.invoke('get-connected-devices'),
    onDeviceDiscovery: (callback) => {
        const listener = (event, device) => callback(device);
        ipcRenderer.on('new-device-found', listener);
        return () => ipcRenderer.removeListener('new-device-found', listener);
    },
    searchForDevices: () => ipcRenderer.invoke('search-for-devices'),

    // Connection functions
    connectBle: (device) => ipcRenderer.invoke('connect-ble', { device }),
    disconnectBle: (device) => ipcRenderer.invoke('disconnect-ble', { device }),
    resetDevices: () => ipcRenderer.invoke('reset-devices'),

    // Data functions
    beginReadingData: () => ipcRenderer.invoke('begin-reading-data'),
    stopRecordingData: () => ipcRenderer.invoke('stop-reading-data'),
    onBeginReading: (callback) => {
        const listener = (_, data) => callback(data);
        ipcRenderer.on('begin-reading', listener);
        return () => ipcRenderer.removeListener('begin-reading', listener);
    },
    onStopReading: (callback) => {
        const listener = () => callback();
        ipcRenderer.on('stop-reading', listener);
        return () => ipcRenderer.removeListener('stop-reading', listener);
    },
    onBLEData: (callback) => {
        const listener = (event, data) => callback(data);
        ipcRenderer.on('new-ble-data', listener);
        return () => ipcRenderer.removeListener('new-ble-data', listener);
    },

    addFlag: (flag) => ipcRenderer.invoke('add-flag', { flag }),
    getFlags: () => ipcRenderer.invoke('get-flags'),
    onNewFlag: (callback) => {
        const listener = (_, flag) => callback(flag);
        ipcRenderer.on('new-flag', listener);
        return () => ipcRenderer.removeListener('new-flag', listener);
    },
    clearFlags: () => ipcRenderer.invoke('clear-flags'),

    restartRecording: () => ipcRenderer.invoke('restart-recording'),
    getRecordingState: () => ipcRenderer.invoke('get-recording-state'),
    onRestartRecording: (callback) => {
        const listener = (_, data) => callback(data);
        ipcRenderer.on('restart-recording', listener);
        return () => ipcRenderer.removeListener('restart-recording', listener);
    },

    endTest: () => ipcRenderer.invoke('end-test'),

    setTestData: (testData) => ipcRenderer.invoke('set-test-data', testData),
    getTestData: () => ipcRenderer.invoke('get-test-data'),

    downloadCSV: (testName) => ipcRenderer.invoke('download-csv', testName),

    submitTestData: (metadata) => ipcRenderer.invoke('submit-test-data', metadata),

    // Add a general removeListener method for backward compatibility
    removeListener: (channel, callback) => {
        if (callback && typeof callback === 'function') {
            ipcRenderer.removeListener(channel, callback);
        }
    }
});