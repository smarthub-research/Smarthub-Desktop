const { ipcMain } = require('electron');
const calculationService = require('./services/calculationService');

function setupCalculationHandlers() {
    ipcMain.handle('calculate-metrics', (event, data) => {
        return calculationService.calculateMetrics(data);
    });

    ipcMain.handle('recalculate-derived-data', () => {
        return calculationService.recalculateDerivedData();
    });

    ipcMain.handle('run-analysis', (event, { dataSet, options }) => {
        return calculationService.runAnalysis(dataSet, options);
    });
}

module.exports = {
    setupCalculationHandlers,
    calculateMetrics: (data) => calculationService.calculateMetrics(data),
    recalculateDerivedData: () => calculationService.recalculateDerivedData()
};