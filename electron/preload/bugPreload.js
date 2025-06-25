const {ipcRenderer} = require("electron");
module.exports =  {
    submitBugReport: (metadata) => ipcRenderer.invoke('submit-bug-report', metadata)
}