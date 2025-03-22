let connectionOne = null;
let connectionTwo = null;
let nearbyPeripherals = [];

module.exports = {
    getConnectionOne: () => connectionOne,
    getConnectionTwo: () => connectionTwo,
    setConnectionOne: (connection) => { connectionOne = connection; },
    setConnectionTwo: (connection) => { connectionTwo = connection; },
    getNearbyPeripherals: () => nearbyPeripherals,
    addNearbyPeripheral: (peripheral) => { nearbyPeripherals.push(peripheral); },
};