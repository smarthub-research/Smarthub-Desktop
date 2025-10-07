const { setupDataHandlers } = require('./dataHandler');
const { setupCalibrationHandlers } = require("./calibrationHandler");
const { deviceManagementHandlers } = require("./deviceManagementHandlers")

function initializeAllHandlers() {
    setupDataHandlers();
    setupCalibrationHandlers();
    deviceManagementHandlers();
}

module.exports = {
    initializeAllHandlers
};
