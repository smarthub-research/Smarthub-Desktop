import React from "react";

/**
 * Loading
 * Minimal placeholder shown while test data is being fetched. Keeps
 * layout stability by occupying available vertical space.
 */
export default function Loading() {
    return (
        <div className="flex grow items-center justify-center h-screen">
            <div className="animate-pulse text-center">
                <p className="mt-4 text-gray-400">Loading test data...</p>
            </div>
        </div>
    );
}