const {ipcRenderer} = require("electron");
module.exports = {
    downloadCSV: (testName) => ipcRenderer.invoke('download-csv', testName),
}