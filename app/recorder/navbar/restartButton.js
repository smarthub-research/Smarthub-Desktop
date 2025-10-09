import {BsArrowCounterclockwise} from "react-icons/bs";

export default function RestartButton({ enabled }) {
    // Restarts the recording by stopping and then starting it again
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
        <button
            onClick={restartRecording}
            disabled={!enabled}
            className={`flex justify-center w-12 h-12 items-center 
                    ${(!enabled) ? 'bg-gray-800 cursor-not-allowed opacity-60' : 'bg-gray-700 hover:bg-gray-600'}
                    rounded-full transition-colors text-white text-xl shadow-md`}>
            <BsArrowCounterclockwise/>
        </button>
    )
}