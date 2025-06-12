import Link from "next/link";

// Component to display a card for the Recorder feature
export default function Recorder() {
    return (
        <div className="group block transform transition-transform duration-300 hover:-translate-y-1.5">
            <div className="relative overflow-hidden bg-white p-6 rounded-xl shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                <div className="absolute top-0 left-0 right-0 h-2 bg-sky-500 transition-all duration-300 ease-out group-hover:bg-sky-400 group-hover:h-3"></div>
                <h2 className="mt-3 text-2xl font-semibold mb-2 text-sky-700 group-hover:text-sky-600 transition-colors duration-300">
                    RECORDER
                </h2>
                <p className="text-gray-600 group-hover:text-gray-500 text-sm transition-colors duration-300">
                    Record data in realtime using your Smarthub Devices. All you have to do is simply pair, record and save.
                    Perfect for collecting high-quality sensor data for further analysis.
                </p>
            </div>
        </div>
    )
}