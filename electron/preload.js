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

    setReviewData: (reviewData) => ipcRenderer.invoke('set-review-data', reviewData),
    getReviewData: () => ipcRenderer.invoke('get-review-data'),
    clearReviewData: () => ipcRenderer.invoke('clear-review-data'),

    downloadCSV: (testName) => ipcRenderer.invoke('download-csv', testName),

    submitTestData: (metadata) => ipcRenderer.invoke('submit-test-data', metadata),
    fetchTestFiles: () => ipcRenderer.invoke('fetch-test-files'),
    fetchTestFilesAmount: (numberOfTests) => ipcRenderer.invoke('fetch-test-files-amount', numberOfTests),
    updateTestName: (id, testName) => ipcRenderer.invoke('update-test-name', id, testName),

    fetchAnnouncements: () => ipcRenderer.invoke('fetch-announcements'),
    setAuthSession: (session) => ipcRenderer.invoke('set-auth-session', session),

    submitBugReport: (metadata) => ipcRenderer.invoke('submit-bug-report', metadata),

    // Add a general removeListener method for backward compatibility
    removeListener: (channel, callback) => {
        if (callback && typeof callback === 'function') {
            ipcRenderer.removeListener(channel, callback);
        }
    }
});