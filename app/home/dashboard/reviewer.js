import Link from "next/link";

// Component to display a card for the Reviewer feature
export default function Reviewer() {
    return (
        <div className="group block transform transition-transform duration-300 hover:-translate-y-1.5">
            <div className="relative overflow-hidden bg-white p-6 rounded-xl shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                <div className="absolute top-0 left-0 right-0 h-2 bg-emerald-500 transition-all duration-300 ease-out group-hover:bg-emerald-400 group-hover:h-3"></div>
                <h2 className="mt-3 text-2xl font-semibold mb-2 text-emerald-700 group-hover:text-emerald-600 transition-colors duration-300">
                    REVIEWER
                </h2>
                <p className="text-gray-600 group-hover:text-gray-500 text-sm transition-colors duration-300">
                    Review data recorded by users in the Recorder. Analyze patterns, generate insights, and export results
                    for comprehensive understanding of your collected sensor data.
                </p>
            </div>
        </div>
    )
}