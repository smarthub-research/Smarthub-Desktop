
import {useEffect, useState} from "react";

// Custom hook to fetch devices
export default function useFetchDevices() {
    const [devices, setDevices] = useState([]);
    const [deviceOne, setDeviceOne] = useState(null);
    const [deviceTwo, setDeviceTwo] = useState(null);

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

    // Fetch connected devices when the component mounts
    useEffect(() => {
        async function fetchConnectedDevices() {
            if (window.electronAPI) {
                const connectedDevices = await window.electronAPI.getConnectedDevices();
                if (connectedDevices[0]) {
                    setDeviceOne(connectedDevices[0]);
                }

                if (connectedDevices[1]) {
                    setDeviceTwo(connectedDevices[1]);
                }
            }
        }
        fetchConnectedDevices();
    }, []);

    return { devices, deviceOne, deviceTwo, setDeviceOne, setDeviceTwo };
}