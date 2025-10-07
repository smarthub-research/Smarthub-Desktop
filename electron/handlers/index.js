const { dataHandlers } = require('./dataHandlers');
const { calibrationHandlers } = require("./calibrationHandler");
const { deviceManagementHandlers } = require("./deviceManagementHandlers")
const { recordingHandlers } = require("./recordingHandlers")
const { testDataHandlers } = require("./testDataHandler")

function initializeAllHandlers() {
    dataHandlers();
    calibrationHandlers();
    deviceManagementHandlers();
    recordingHandlers();
    testDataHandlers();
}

module.exports = {
    initializeAllHandlers
};
