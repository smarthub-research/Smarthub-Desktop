import React from "react";
import Link from "next/link";

export default function Page() {
    return (
        <div className="flex flex-col min-h-screen w-full bg-gradient-to-b from-gray-900 to-black text-white overflow-x-hidden justify-center items-center p-4">
            <div className="container mx-auto text-center mb-10">
                <h1 className="font-bold text-[4vw] md:text-5xl tracking-[0.4rem] leading-tight mb-6">
                    SMARTHUB
                </h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl w-full">
                <Link href="/smarthubRecorder" className="group">
                    <div className="bg-black bg-opacity-60 hover:bg-opacity-80 p-8 rounded-xl transition border border-gray-800 hover:border-blue-500 h-full transform hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-900/20">
                        <h2 className="text-[2vw] md:text-2xl tracking-[0.5rem] leading-tight mb-4 text-blue-400 group-hover:text-blue-300">
                            RECORDER
                        </h2>
                        <p className="text-gray-300 group-hover:text-white">
                            Record data in realtime using your Smarthub Devices. All you have to do is simply pair, record and save.
                            Perfect for collecting high-quality sensor data for further analysis.
                        </p>
                    </div>
                </Link>

                <Link href="/smarthubReviewer/" className="group">
                    <div className="bg-black bg-opacity-60 hover:bg-opacity-80 p-8 rounded-xl transition border border-gray-800 hover:border-green-500 h-full transform hover:-translate-y-1 hover:shadow-xl hover:shadow-green-900/20">
                        <h2 className="text-[2vw] md:text-2xl tracking-[0.5rem] leading-tight mb-4 text-green-400 group-hover:text-green-300">
                            REVIEWER
                        </h2>
                        <p className="text-gray-300 group-hover:text-white">
                            Review data recorded by users in the Recorder. Analyze patterns, generate insights, and export results
                            for comprehensive understanding of your collected sensor data.
                        </p>
                    </div>
                </Link>
            </div>
        </div>
    );
}