const {ipcRenderer} = require("electron");

module.exports = {
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
}