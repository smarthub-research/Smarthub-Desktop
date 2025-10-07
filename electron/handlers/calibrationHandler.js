/*

Establishes entries for getting and setting calibrations

*/

const { ipcMain } = require("electron");
const calibrationService = require("../services/calibrationService");

function calibrationHandlers() {
    // Sets a calibration
    ipcMain.handle('set-calibration', async (_, calibration) => {
        calibrationService.setCalibration(calibration);
        return true;
    });

    // gets and returns the active calibration
    ipcMain.handle("get-calibration", async (_) => {
        return calibrationService.getCalibration();
    });
}

module.exports = {
    calibrationHandlers
}