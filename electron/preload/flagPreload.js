const {ipcRenderer} = require("electron");

module.exports = {
    addFlag: (flag) => ipcRenderer.invoke('add-flag', { flag }),
        getFlags: () => ipcRenderer.invoke('get-flags'),
        onNewFlag: (callback) => {
        const listener = (_, flag) => callback(flag);
        ipcRenderer.on('new-flag', listener);
        return () => ipcRenderer.removeListener('new-flag', listener);
    },
        clearFlags: () => ipcRenderer.invoke('clear-flags'),
}