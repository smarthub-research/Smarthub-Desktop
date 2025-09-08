const { setupDiscoveryHandlers } = require('./deviceDiscovery');
const { setupConnectionHandlers } = require('./connectionHandlers');
const { setupDataHandlers } = require('./data/dataHandler');
const {setupFlagHandlers} = require("./flagHandlers");
const { setupCalibrationHandlers } = require("./calibrationHandler");

function initializeAllHandlers() {
    setupDiscoveryHandlers();
    setupConnectionHandlers();
    setupDataHandlers();
    setupFlagHandlers();
    setupCalibrationHandlers();
}

module.exports = {
    initializeAllHandlers
};
