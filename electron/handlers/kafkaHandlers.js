/**
 * Kafka-related IPC handlers.
 *
 * Exposes minimal controls to check and trigger Kafka initialization from
 * the renderer. The heavy-lifting is performed by `dataService` which owns
 * the Kafka client state.
 */

const { ipcMain } = require('electron');
const dataService = require('../services/dataService');

function kafkaHandlers() {
    // Return Kafka initialization status
    ipcMain.handle('check-kafka-status', async () => {
        return {
            initialized: dataService.kafkaInitialized,
            initializing: dataService.kafkaInitializing
        };
    });

    // Allow manual initialization trigger for debugging/edge-cases
    ipcMain.handle('initialize-kafka', async () => {
        try {
            const success = await dataService.initializeKafka();
            return { success };
        } catch (error) {
            console.error('Manual Kafka initialization failed:', error);
            return { success: false, error: error.message };
        }
    });
}

module.exports = {
    kafkaHandlers
};
