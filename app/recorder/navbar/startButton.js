import {BsFillPlayFill} from "react-icons/bs";

export default function StartButton({ recording }) {
    // Lets us receive BLE data from the main process
    async function beginBleReading() {
        try {
            if (window.electronAPI) {
                await window.electronAPI.beginReadingData();
                // Setting recording state is now handled by the IPC listener
            }
        } catch (error) {
            console.error("Error starting BLE reading:", error);
        }
    }

    return (
        <button
            onClick={beginBleReading}
            disabled={recording}
            className={`flex justify-center items-center w-12 h-12 rounded-full
                    ${recording ? 'bg-green-800 cursor-not-allowed opacity-50' : 'bg-green-600 hover:bg-green-500'}
                    transition-colors text-white text-xl shadow-md`}>
            <BsFillPlayFill/>
        </button>
    )
}