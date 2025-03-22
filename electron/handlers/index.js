const { setupDiscoveryHandlers } = require('./deviceDiscovery');
const { setupConnectionHandlers } = require('./connectionHandlers');
const { setupDataHandlers } = require('./dataHandlers');

function initializeAllHandlers() {
    setupDiscoveryHandlers();
    setupConnectionHandlers();
    setupDataHandlers();

    console.log('All IPC handlers initialized');
}

module.exports = {
    initializeAllHandlers
};
