import { BsFillPlayFill } from "react-icons/bs";
import { BsFillStopFill } from "react-icons/bs";
import { BsArrowCounterclockwise } from "react-icons/bs";
import { BsFillFlagFill } from "react-icons/bs";
import { useState, useEffect } from "react";

// Component for the control panel with buttons to start, stop, and restart recording,
export default function ControlPanel({setFlagging, flagging}) {
    const [recording, setRecording] = useState(false);

    // Set up and clean up IPC listeners
    useEffect(() => {
        if (!window.electronAPI) return;

        // Define event handlers
        const handleBeginReading = () => {
            console.log("Begin reading handler triggered");
            setRecording(true);
        };

        // Stop reading data
        const handleStopReading = () => {
            console.log("Stop reading handler triggered");
            setRecording(false);
        };

        // Register event listeners
        window.electronAPI.onBeginReading(handleBeginReading);
        window.electronAPI.onStopReading(handleStopReading);

        // Clean up function to remove listeners when component unmounts
        return () => {
            if (window.electronAPI) {
                window.electronAPI.removeListener('begin-reading', handleBeginReading);
                window.electronAPI.removeListener('stop-reading', handleStopReading);
            }
        };
    }, []);

    // Lets us receive BLE data from the main process
    async function beginBleReading() {
        try {
            if (window.electronAPI) {
                console.log("Starting BLE reading");
                await window.electronAPI.beginReadingData();
                // Setting recording state is now handled by the IPC listener
            }
        } catch (error) {
            console.error("Error starting BLE reading:", error);
        }
    }

    // Stops the BLE recording and sets the recording state to false
    async function stopRecording() {
        try {
            if (window.electronAPI) {
                console.log("Stopping BLE recording");
                await window.electronAPI.stopRecordingData();
                // Setting recording state is now handled by the IPC listener
            }
        } catch (error) {
            console.error("Error stopping recording:", error);
        }
    }

    // Restarts the recording by stopping and then starting it again
    async function restartRecording() {
        try {
            if (window.electronAPI) {
                console.log("Restarting recording");
                await window.electronAPI.restartRecording();
                await window.electronAPI.clearFlags();
            }
        } catch (error) {
            console.error("Error restarting recording:", error);
        }
    }

    return (
        <>
            <div
                className="p-4 flex flex-row h-full gap-3  px-4 items-center justify-center justify-self-end rounded-xl">
                <button
                    onClick={beginBleReading}
                    disabled={recording}
                    className={`flex justify-center items-center w-12 h-12 rounded-full
                    ${recording ? 'bg-green-800 cursor-not-allowed opacity-50' : 'bg-green-600 hover:bg-green-500'}
                    transition-colors text-white text-xl shadow-md`}>
                    <BsFillPlayFill/>
                </button>

                <button
                    onClick={stopRecording}
                    disabled={!recording}
                    className={`flex justify-center items-center w-12 h-12 rounded-full
                    ${!recording ? 'bg-red-800 cursor-not-allowed opacity-50' : 'bg-red-600 hover:bg-red-500'}
                    transition-colors text-white text-xl shadow-md`}>
                    <BsFillStopFill/>
                </button>

                <button
                    onClick={restartRecording}
                    className="flex justify-center w-12 h-12 items-center bg-gray-700 hover:bg-gray-600
                    rounded-full transition-colors text-white text-xl shadow-md">
                    <BsArrowCounterclockwise/>
                </button>

                <button
                    onClick={setFlagging}
                    className={`flex justify-center items-center w-12 h-12 border border-gray-600
                    hover:bg-gray-800 rounded-full transition-colors text-white text-xl shadow-md
                    ${flagging ? 'bg-black opacity-50' : 'bg-transparent'}`}>
                    <BsFillFlagFill/>
                </button>
            </div>
        </>
    );
}