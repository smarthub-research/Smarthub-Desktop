/**
 * Calibration IPC handlers.
 *
 * Registers `ipcMain` handlers used by the renderer to control and query
 * the calibration lifecycle (set/get calibration, begin/end static
 * calibration). Handlers delegate to the `calibrationService`.
 */

const { ipcMain } = require("electron");
const calibrationService = require("../services/calibrationService");

function calibrationHandlers() {
    // Set the active calibration object
    ipcMain.handle('set-calibration', async (_, calibration) => {
        calibrationService.setCalibration(calibration);
        return true;
    });

    // Return the currently active calibration
    ipcMain.handle("get-calibration", async () => {
        return calibrationService.getCalibration();
    });

    // Begin the static/dynamic calibration routine
    ipcMain.handle("begin-static-calibration", async () => {
        await calibrationService.beginStaticCalibration();
        return true;
    });

    // End the static calibration and persist results
    ipcMain.handle("end-static-calibration", async () => {
        await calibrationService.endStaticCalibration();
        return true;
    });
}

module.exports = {
    calibrationHandlers
}