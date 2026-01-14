/**
 * Simple in-memory connection registry used by the main process.
 *
 * Responsibilities:
 * - Hold the two active BLE connection objects (left / right or device 1/2)
 * - Maintain a list of recently discovered nearby peripherals (discovery cache)
 *
 * This module intentionally exposes plain getters/setters and a lightweight
 * duplicate-avoidant list for discovered devices — it is NOT a persistence
 * layer. Values live only for the process lifetime.
 */

let connectionOne = null;
let connectionTwo = null;
let nearbyPeripherals = [];

module.exports = {
    // Active connection accessors
    getConnectionOne: () => connectionOne,
    getConnectionTwo: () => connectionTwo,
    setConnectionOne: (connection) => { connectionOne = connection; },
    setConnectionTwo: (connection) => { connectionTwo = connection; },

    // Nearby peripheral discovery helpers
    // Returns the current discovery cache (array of peripheral objects)
    getNearbyPeripherals: () => nearbyPeripherals,

    // Add a discovered peripheral to the cache. Avoids duplicates by UUID.
    addNearbyPeripheral: (peripheral) => {
        if (!nearbyPeripherals.find(p => p.uuid === peripheral.uuid)) {
            nearbyPeripherals.push(peripheral);
        }
    },

    // Clear only the discovery cache. Does not close or mutate connections.
    clearNearbyPeripherals: () => { nearbyPeripherals = []; }
};