
import { useState } from "react";
import ConnectionButton from "./connectionButton";
import { Badge } from "../../components/ui/badge";

// Device component to handle BLE device connections
export default function Device({ device, status, onConnect, onDisconnect }) {
    const [connecting, setConnecting] = useState(false);

    // Determine if the device is connectable and call ipc to connect to it
    const connectToBle = async () => {
        if (status === "cannotConnect" || !onConnect) return;
        setConnecting(true);
        try {
            if (window.electronAPI) {
                await window.electronAPI.connectBle(device);
                onConnect(device);
            }
        } catch (error) {
            console.error("Error connecting:", error);
        } finally {
            setConnecting(false);
        }
    };

    // Disconnect from the BLE device
    const disconnectBle = async () => {
        if (onDisconnect) {
            await window.electronAPI.disconnectBle(device);
            onDisconnect(device);
        }
    };

    return (
        <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-3">
                <div>
                    <p className="font-medium">{device.name}</p>
                </div>
            </div>
            {device.name !== "No Connected Device" && (
                <div className="flex items-center gap-2">
                    {status === "connected" && (
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                            Connected
                        </Badge>
                    )}
                    <ConnectionButton
                        clickAction={status === "connected" ? disconnectBle : connectToBle}
                        status={status}
                        disabled={status === "cannotConnect"}
                        connecting={connecting}
                    />
                </div>
            )}
        </div>
    );
}