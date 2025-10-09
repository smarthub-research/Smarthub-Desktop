const { dataHandlers } = require('./dataHandlers');
const { calibrationHandlers } = require("./calibrationHandlers");
const { deviceManagementHandlers } = require("./deviceManagementHandlers")
const { recordingHandlers } = require("./recordingHandlers")
const { testDataHandlers } = require("./testDataHandlers")

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
