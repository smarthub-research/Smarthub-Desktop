import {BsFillStopFill} from "react-icons/bs";

export default function  StopButton({ recording}) {
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
            disabled={!recording}
            className={`flex justify-center items-center w-12 h-12 rounded-full
                    ${!recording ? 'bg-red-800 cursor-not-allowed opacity-50' : 'bg-red-600 hover:bg-red-500'}
                    transition-colors text-white text-xl shadow-md`}>
            <BsFillStopFill/>
        </button>
    )
}