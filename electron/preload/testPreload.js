const { contextBridge, ipcRenderer } = require('electron');

testBridge = {
    setTestData: (testData) => ipcRenderer.invoke('set-test-data', testData),
    getTestData: () => ipcRenderer.invoke('get-test-data'),
    setReviewData: (reviewData) => ipcRenderer.invoke('set-review-data', reviewData),
    getReviewData: () => ipcRenderer.invoke('get-review-data'),
    submitTestData: (metadata) => ipcRenderer.invoke('submit-test-data', metadata),
    fetchTestFilesAmount: (numberOfTests) => ipcRenderer.invoke('fetch-test-files-amount', numberOfTests),
    fetchTestFiles: () => ipcRenderer.invoke('fetch-test-files'),
    updateTestName: (id, testName) => ipcRenderer.invoke('update-test-name', id, testName),
}

module.exports = testBridge