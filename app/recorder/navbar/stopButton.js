import {BsFillStopFill} from "react-icons/bs";

// Button component for stopping the recording session.
// Props:
// - `enabled`: Boolean to enable/disable the button based on device connection.
// - `recording`: Boolean indicating if recording is currently active.
// Purpose: Stops BLE data reading and triggers data saving/fetching from backend.
export default function  StopButton({ enabled, recording}) {
    // Stops the BLE recording and sets the recording state to false
    async function stopRecording() {
        try {
            if (window.electronAPI) {
                await window.electronAPI.stopRecordingData();
                // Setting recording state is now handled by the IPC listener
            }
        } catch (error) {
            console.error("Error stopping recording:", error);
        }
    }

    return (
        <button
            onClick={stopRecording}
            disabled={!recording || !enabled}
            className={`flex justify-center items-center w-12 h-12 rounded-full
                    ${(!recording || !enabled) ? 'bg-red-800 cursor-not-allowed opacity-60' : 'bg-red-600 hover:bg-red-500'}
                    transition-colors text-white text-xl shadow-md`}>
            <BsFillStopFill/>
        </button>
    )
}