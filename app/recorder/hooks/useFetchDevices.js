
import { useEffect, useState } from "react";

// Module-level shared store so multiple components using the hook share the same state
// This ensures that device state is synchronized across all components using this hook
let devicesState = [];
let deviceOneState = null;
let deviceTwoState = null;
const listeners = new Set();
let initialized = false;

// Notify all listeners of state changes
function notifyListeners() {
    const snapshot = { devices: devicesState, deviceOne: deviceOneState, deviceTwo: deviceTwoState };
    listeners.forEach((l) => {
        try { l(snapshot); } catch (e) { /* ignore listener errors */ }
    });
}

// Custom hook to manage BLE device discovery and connection state.
// Uses a shared module-level store to synchronize device state across components.
// Purpose: Provides centralized device management for the connector interface.
// Returns: Object with devices array, deviceOne/deviceTwo objects, and setter functions.
export default function useFetchDevices() {
    const [state, setState] = useState({ devices: devicesState, deviceOne: deviceOneState, deviceTwo: deviceTwoState });

    // Subscribe to shared store updates
    useEffect(() => {
        const listener = (newState) => setState(newState);
        listeners.add(listener);
        // sync immediately in case module state changed before this hook ran
        listener({ devices: devicesState, deviceOne: deviceOneState, deviceTwo: deviceTwoState });
        return () => listeners.delete(listener);
    }, []);

    // Initialize electronAPI listeners only once per module load
    useEffect(() => {
        if (initialized) return;
        initialized = true;

        if (typeof window !== "undefined" && window.electronAPI) {
            // start searching for devices and listen for discoveries
            try { window.electronAPI.searchForDevices(); } catch (e) { /* ignore in non-electron env */ }

            if (window.electronAPI.onDeviceDiscovery) {
                window.electronAPI.onDeviceDiscovery((newDevice) => {
                    const exists = devicesState.some((d) => d?.name === newDevice?.name);
                    if (!exists) {
                        devicesState = [...devicesState, newDevice];
                        notifyListeners();
                    }
                });
            }

            // fetch connected devices once at startup
            (async () => {
                try {
                    if (window.electronAPI.getConnectedDevices) {
                        const connectedDevices = await window.electronAPI.getConnectedDevices();
                        if (connectedDevices?.[0]) deviceOneState = connectedDevices[0];
                        if (connectedDevices?.[1]) deviceTwoState = connectedDevices[1];
                        notifyListeners();
                    }
                } catch (e) {
                    // ignore errors during initial fetch
                }
            })();
        }
    }, []);

    // setters that update module state and notify subscribers
    const setDeviceOne = (d) => {
        deviceOneState = d;
        notifyListeners();
    };

    const setDeviceTwo = (d) => {
        deviceTwoState = d;
        notifyListeners();
    };

    return { devices: state.devices, deviceOne: state.deviceOne, deviceTwo: state.deviceTwo, setDeviceOne, setDeviceTwo };
}