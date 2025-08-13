import React from "react";

export default function Loading() {
    return (
        <div className="flex grow items-center justify-center h-screen">
            <div className="animate-pulse text-center">
                <p className="mt-4 text-gray-400">Loading test data...</p>
            </div>
        </div>
    );
}