'use client'
import Loader from "../../components/loader";
import { useState } from "react";

// Button component for managing device connection states and actions.
// Props:
// - `clickAction`: Function to execute when the button is clicked (e.g., connect or disconnect).
// - `status`: String indicating the current connection status ('connected', 'notConnected', 'cannotConnect').
// - `connecting`: Boolean indicating if a connection attempt is in progress.
// - `disabled`: Boolean to disable the button regardless of status.
// Purpose: Provides a visual button that changes appearance based on connection status and handles connection/disconnection actions.
export default function ConnectionButton({ clickAction, status, connecting, disabled }) {
    const [text, setText] = useState("");

    // Function to determine button styles based on the current connection status
    const getButtonStyles = () => {
        switch (status) {
            case "connected":
                return "bg-green-700 hover:bg-red-700 text-white";
            case "notConnected":
                return "bg-primary-400 hover:bg-primary-600 text-white";
            case "cannotConnect":
                return "bg-gray-800 text-gray-400 cursor-not-allowed opacity-60";
            default:
                return "bg-gray-800 text-gray-300";
        }
    };

    // Function to handle button click, preventing action if status is 'cannotConnect' or button is disabled
    const handleClick = () => {
        if (status === "cannotConnect" || disabled) return;
        clickAction();
    };

    // If currently connecting, display a loading state instead of the button
    if (connecting) {
        return (
            <div className="text-white bg-gray-800 px-3 py-1 text-sm text-center rounded-lg flex items-center justify-center">
                Connecting...
            </div>
        );
    }

    return (
        <button
            onMouseLeave={() => setText("")}
            onClick={handleClick}
            disabled={status === "cannotConnect" || disabled}
            className={`${getButtonStyles()} px-3 py-1 text-center 
            rounded-md transition-all duration-300 text-sm font-medium cursor-pointer`}
        >
            {text || (status === "connected" ? "Disconnect"
                : status === "notConnected" ? "Connect"
                    : "Not Available")}
        </button>
    );
}