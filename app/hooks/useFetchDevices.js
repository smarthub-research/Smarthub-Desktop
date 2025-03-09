import {useEffect, useState} from "react";


export default function useFetchDevices() {
    const [devices, setDevices] = useState([]);

    // Fetch nearby devices
    useEffect(() => {
        if (window.electronAPI) {
            window.electronAPI.searchForDevices();
            window.electronAPI.onDeviceDiscovery((newDevice) => {
                setDevices(prevDevices => {
                    if (!prevDevices.some(dev => dev[0] === newDevice[0])) {
                        return [...prevDevices, newDevice]; // Return new array
                    }
                    return prevDevices; // If device exists, return old state
                });
            });
        }
    }, []);

    return { devices };
}