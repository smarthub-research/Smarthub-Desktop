const {ipcRenderer} = require("electron");

module.exports = {
    getConnectedDevices: () => ipcRenderer.invoke('get-connected-devices'),
    onDeviceDiscovery: (callback) => {
        const listener = (event, device) => callback(device);
        ipcRenderer.on('new-device-found', listener);
        return () => ipcRenderer.removeListener('new-device-found', listener);
    },
    searchForDevices: () => ipcRenderer.invoke('search-for-devices'),
    connectBle: (device) => ipcRenderer.invoke('connect-ble', { device }),
    disconnectBle: (device) => ipcRenderer.invoke('disconnect-ble', { device }),
    resetDevices: () => ipcRenderer.invoke('reset-devices')
}