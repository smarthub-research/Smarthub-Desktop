
import { useState } from "react";
import ConnectionButton from "./connectionButton";
import { Badge } from "../../components/ui/badge";

// Component for displaying and managing individual BLE device connections.
// Props:
// - `device`: Object representing the BLE device with properties like name.
// - `status`: String indicating the connection status ('connected', 'notConnected', 'cannotConnect').
// - `onConnect`: Function called when the device is successfully connected.
// - `onDisconnect`: Function called when the device is disconnected.
// Purpose: Provides a UI element for each device, showing its name, connection status, and connection/disconnection controls.
export default function Device({ device, status, onConnect, onDisconnect }) {
    const [connecting, setConnecting] = useState(false);

    // Asynchronous function to connect to the BLE device via Electron API
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

    // Asynchronous function to disconnect from the BLE device
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