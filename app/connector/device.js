import { useState } from "react";
import ConnectionButton from "./connectionButton";

export default function Device({ device, status, onConnect, onDisconnect }) {
    const [connecting, setConnecting] = useState(false);

    const connectToBle = async () => {
        if (status === "cannotConnect" || !onConnect) return;
        setConnecting(true);
        try {
            if (window.electronAPI) {
                await window.electronAPI.connectBle(device);
                onConnect(device);
            } else {
                console.warn("Electron API not available");
            }
        } catch (error) {
            console.error("Error connecting:", error);
        } finally {
            setConnecting(false);
        }
    };

    const disconnectBle = async () => {
        if (onDisconnect) {
            await window.electronAPI.disconnectBle(device);
            onDisconnect(device);
        }
    };

    return (
        <div className="flex flex-row items-center justify-between gap-3 py-2 transition-colors duration-200 rounded-lg px-3">
            <div className="flex-grow min-w-0">
                <p className="text-base sm:text-lg font-semibold text-white truncate">{device.name}</p>
                <p className="text-xs sm:text-sm text-gray-400 truncate">{device.UUID}</p>
            </div>
            <ConnectionButton
                clickAction={status === "connected" ? disconnectBle : connectToBle}
                status={status}
                disabled={status === "cannotConnect"}
                connecting={connecting}
            />
        </div>
    );
}