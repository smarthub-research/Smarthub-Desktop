const { ipcMain } = require('electron');

function setupBugHandlers() {
    // This is where you would set up your bug handlers
    // For example:
    // ipcMain.on('bug-report', (event, arg) => {
    //     console.log('Bug report received:', arg);
    // });
    console.log('Bug handlers initialized');

    ipcMain.handle('submit-bug-report', async (event, metadata) => {
        submitBug(metadata);
    })
}

const key = 'YOUR_API_KEY';
const token = 'YOUR_API_TOKEN';
const listId = 'YOUR_LIST_ID';

async function submitBug(metadata) {

    const cardTitle = metadata.title;
    const cardDesc = "Email: " + metadata.email + '\n\n' +
        metadata.description + '\n\n' + "Steps to reproduce: " +
        metadata.stepsToReproduce + '\n\n' +
        "Expected behavior: " + metadata.expectedBehavior + '\n\n' +
        "Actual behavior: " + metadata.actualBehavior + '\n\n' +
        "Device info: " + metadata.deviceInfo;

    const url = `https://api.trello.com/1/cards?key=${key}&token=${token}&idList=${listId}&name=${encodeURIComponent(cardTitle)}&desc=${encodeURIComponent(cardDesc)}`;

    fetch(url, { method: 'POST'} )
        .then(res => res.json())
        .then(data => {
            console.log('Card added:', data);
        })
        .catch(err => {
            console.error('Error:', err);
        });
}

module.exports = {
    setupBugHandlers,
}