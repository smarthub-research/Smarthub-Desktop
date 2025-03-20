import { useState } from "react";
import ConnectionButton from "./connectionButton";

export default function Device({ device, status, onConnect, onDisconnect }) {
    const [connecting, setConnecting] = useState(false);

    const connectToBle = async () => {
        if (status === "cannotConnect" || !onConnect) return; // Prevent connecting if disabled
        setConnecting(true);
        try {
            if (window.electronAPI) {
                await window.electronAPI.connectBle(device);
                onConnect(device); // Notify parent component
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
        <div className={`flex flex-row px-2 justify-between items-center`}>
            <div>
                <p className="text-lg font-semibold">{device[0]}</p>
                <p className="text-sm opacity-50">{device[1]}</p>
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
