import {useEffect, useState} from "react";

// Custom hook to fetch devices
export default function useFetchDevices() {
    const [devices, setDevices] = useState([]);

    // Fetch nearby devices
    useEffect(() => {
        if (window.electronAPI) {
            window.electronAPI.searchForDevices();
            window.electronAPI.onDeviceDiscovery((newDevice) => {
                setDevices(prevDevices => {
                    if (!prevDevices.some(dev => dev.name === newDevice.name)) {
                        return [...prevDevices, newDevice]; // Return new array
                    }
                    return prevDevices; // If device exists, return old state
                });
            });
        }
    }, []);

    return { devices };
}