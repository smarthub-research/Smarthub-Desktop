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

    ipcMain.handle("begin-static-calibration", async(_) => {
        await calibrationService.beginStaticCalibration();
        return true;
    });

    // End static calibration
    ipcMain.handle("end-static-calibration", async(_) => {
        await calibrationService.endStaticCalibration();
        return true;
    });
}

module.exports = {
    calibrationHandlers
}