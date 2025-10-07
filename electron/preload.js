/*

This file contains the IPC functions to be invoked by the electron API.
It is split into sections based on each handler file necessary.

*/

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
    connectBle: (device) => ipcRenderer.invoke('connect-ble', { device }),
    disconnectBle: (device) => ipcRenderer.invoke('disconnect-ble', { device }),
    resetDevices: () => ipcRenderer.invoke('reset-devices'),
    checkConnectionStatus: () => ipcRenderer.invoke('check-connection-status'),
    setupDisconnectionListeners: () => ipcRenderer.invoke('setup-disconnection-listeners'),
    onDeviceDisconnected: (callback) => {
        const listener = (_, data) => callback(data);
        ipcRenderer.on('device-disconnected', listener);
        return () => ipcRenderer.removeListener('device-disconnected', listener);
    },

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

    // Recording functions
    restartRecording: () => ipcRenderer.invoke('restart-recording'),
    getRecordingState: () => ipcRenderer.invoke('get-recording-state'),
    onRestartRecording: (callback) => {
        const listener = (_, data) => callback(data);
        ipcRenderer.on('restart-recording', listener);
        return () => ipcRenderer.removeListener('restart-recording', listener);
    },
    endTest: () => ipcRenderer.invoke('end-test'),

    // Test functions
    setTestData: (testData) => ipcRenderer.invoke('set-test-data', testData),
    getTestData: () => ipcRenderer.invoke('get-test-data'),

    // Review Functions
    setReviewData: (reviewData) => ipcRenderer.invoke('set-review-data', reviewData),
    getReviewData: () => ipcRenderer.invoke('get-review-data'),
    clearReviewData: () => ipcRenderer.invoke('clear-review-data'),

    // Export functions
    downloadCSV: (testName) => ipcRenderer.invoke('download-csv', testName),

    // Supabase functions
    submitTestData: (metadata) => ipcRenderer.invoke('submit-test-data', metadata),
    fetchTestFiles: () => ipcRenderer.invoke('fetch-test-files'),
    updateTestName: (id, testName) => ipcRenderer.invoke('update-test-name', id, testName),

    // Calibration functions
    setCalibration: (calibration) => ipcRenderer.invoke("set-calibration", calibration),

    removeListener: (channel, callback) => {
        if (callback && typeof callback === 'function') {
            ipcRenderer.removeListener(channel, callback);
        }
    }
});