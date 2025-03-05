const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    beginReadingData: () => ipcRenderer.invoke('begin-reading-data'),
    stopRecordingData: () => ipcRenderer.invoke('stop-reading-data'),
    onBLEData: (callback) => ipcRenderer.on('new-ble-data', (event, data) => callback(data)),
    connectBle: () => ipcRenderer.invoke('connect-ble'),
});
