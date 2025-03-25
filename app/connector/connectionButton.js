'use client'
import Loader from "../Loader";
import { useState } from "react";

export default function ConnectionButton({ clickAction, status, connecting, disabled }) {
    const [text, setText] = useState("");

    const getButtonStyles = () => {
        switch (status) {
            case "connected":
                return "bg-green-700 hover:bg-red-700 text-white";
            case "notConnected":
                return "bg-blue-600 hover:bg-blue-500 text-white";
            case "cannotConnect":
                return "bg-gray-800 text-gray-400 cursor-not-allowed opacity-60";
            default:
                return "bg-gray-800 text-gray-300";
        }
    };

    const handleClick = () => {
        if (status === "cannotConnect" || disabled) return;
        clickAction();
    };

    if (connecting) {
        return (
            <div className="min-w-[6rem] sm:min-w-[7rem] md:min-w-[8rem] bg-gray-800 px-3 py-2 text-center rounded-lg flex items-center justify-center h-10">
                <Loader />
            </div>
        );
    }

    return (
        <button
            onMouseEnter={() => status === "connected" && setText("Disconnect")}
            onMouseLeave={() => setText("")}
            onClick={handleClick}
            disabled={status === "cannotConnect" || disabled}
            className={`${getButtonStyles()} min-w-[6rem] sm:min-w-[7rem] md:min-w-[8rem] px-3 py-2 text-center 
            rounded-lg transition-all duration-300 text-sm font-medium h-10 cursor-pointer`}
        >
            {text || (status === "connected" ? "Connected"
                : status === "notConnected" ? "Connect"
                    : "Not Available")}
        </button>
    );
}