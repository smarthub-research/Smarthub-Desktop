const {ipcRenderer} = require("electron");

module.exports = {
    restartRecording: () => ipcRenderer.invoke('restart-recording'),
    getRecordingState: () => ipcRenderer.invoke('get-recording-state'),
    onRestartRecording: (callback) => {
        const listener = (_, data) => callback(data);
        ipcRenderer.on('restart-recording', listener);
        return () => ipcRenderer.removeListener('restart-recording', listener);
    },
    endTest: () => ipcRenderer.invoke('end-test'),
}