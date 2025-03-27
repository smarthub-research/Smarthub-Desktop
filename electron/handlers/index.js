const { setupDiscoveryHandlers } = require('./deviceDiscovery');
const { setupConnectionHandlers } = require('./connectionHandlers');
const { setupDataHandlers } = require('./dataHandlers');
const {setupFlagHandlers} = require("./flagHandlers");

function initializeAllHandlers() {
    setupDiscoveryHandlers();
    setupConnectionHandlers();
    setupDataHandlers();
    setupFlagHandlers();
    console.log('All IPC handlers initialized');
}

module.exports = {
    initializeAllHandlers
};
