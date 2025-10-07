/*

Stores both BLE connections as well as any picked up nearby devices.
These connections can be set and retrieved like class instance variables

*/

let connectionOne = null;
let connectionTwo = null;
let nearbyPeripherals = [];

module.exports = {
    getConnectionOne: () => connectionOne,
    getConnectionTwo: () => connectionTwo,
    setConnectionOne: (connection) => { connectionOne = connection; },
    setConnectionTwo: (connection) => { connectionTwo = connection; },
    getNearbyPeripherals: () => nearbyPeripherals,
    addNearbyPeripheral: (peripheral) => { 
        // Avoid duplicates
        if (!nearbyPeripherals.find(p => p.uuid === peripheral.uuid)) {
            nearbyPeripherals.push(peripheral); 
        }
    },
    clearNearbyPeripherals: () => { nearbyPeripherals = []; }
};