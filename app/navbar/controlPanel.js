import { BsFillPlayFill } from "react-icons/bs";
import { BsFillStopFill } from "react-icons/bs";
import { BsArrowCounterclockwise } from "react-icons/bs";
import { BsFillFlagFill } from "react-icons/bs";
import { useState } from "react";

export default function ControlPanel({setFlagging}) {
    const [recording, setRecording] = useState(false);

    async function beginBleReading() {
        try {
            if (window.electronAPI) {
                await window.electronAPI.beginReadingData();
                setRecording(true);
            }
        } catch (error) {
            console.error("Error starting BLE reading:", error);
        }
    }

    async function stopRecording() {
        try {
            if (window.electronAPI) {
                await window.electronAPI.stopRecordingData();
                setRecording(false);
            }
        } catch (error) {
            console.error("Error stopping recording:", error);
        }
    }

    async function restartRecording() {
        try {
            if (window.electronAPI) {
                await window.electronAPI.restartRecording();
            }
        } catch (error) {
            console.error("Error restarting recording:", error);
        }
    }



    return (
        <>
            <div
                className="p-4 flex flex-row h-full gap-3 bg-[#0a0a0a] px-4 items-center justify-center justify-self-end rounded-xl shadow-md">
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
                    className="flex justify-center items-center w-12 h-12 border border-gray-600
                    hover:bg-gray-800 rounded-full transition-colors text-white text-xl shadow-md">
                    <BsFillFlagFill/>
                </button>

            </div>

        </>

    );
}