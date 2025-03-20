'use client'
import Loader from "./Loader";
import { useState } from "react";

export default function ConnectionButton({ clickAction, status, connecting }) {
    const [text, setText] = useState("");

    const bgColor =
        status === "connected" ? "bg-green-700 hover:bg-red-700 ease-in transition-[500ms]"
            : status === "notConnected" ? "bg-blue-500"
                : status === "cannotConnect" ? "bg-[#262626]"
                    : "bg-black";

    const handleClick = () => {
        if (status === "cannotConnect") return; // Prevent click
        console.log("Button clicked with status:", status);
        clickAction();
    };

    if (connecting) {
        return (
            <div className="w-[8rem] bg-[#262626] px-4 py-2 text-center rounded-xl">
                <Loader />
            </div>
        );
    }

    return (
        <p
            onMouseEnter={() => status === "connected" && setText("Disconnect")}
            onMouseLeave={() => setText("")} // Reset text on hover out
            onClick={handleClick}
            className={`${bgColor} w-[8rem] px-4 py-2 text-center rounded-xl cursor-pointer 
                ${status === "cannotConnect" ? "cursor-not-allowed opacity-50" : ""}`}
        >
            {text || (status === "connected" ? "Connected"
                : status === "notConnected" ? "Connect"
                    : "Not Available")}
        </p>
    );
}
