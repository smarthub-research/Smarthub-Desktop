/**
 * Central handler registration.
 *
 * Imports individual handler setup functions and runs them once to register
 * the application's IPC handlers with `ipcMain`.
 */

const { dataHandlers } = require('./dataHandlers');
const { calibrationHandlers } = require("./calibrationHandlers");
const { deviceManagementHandlers } = require("./deviceManagementHandlers")
const { recordingHandlers } = require("./recordingHandlers")
const { testDataHandlers } = require("./testDataHandlers")
const { kafkaHandlers } = require("./kafkaHandlers")

function initializeAllHandlers() {
    dataHandlers();
    calibrationHandlers();
    deviceManagementHandlers();
    recordingHandlers();
    testDataHandlers();
    kafkaHandlers();
}

module.exports = {
    initializeAllHandlers
};
