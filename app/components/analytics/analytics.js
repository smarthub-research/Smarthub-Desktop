"use client"

import { useAuth } from "../../auth/authContext";
import { FaEnvelope, FaCheckCircle, FaClipboardList } from "react-icons/fa";

export default function Analytics({ testFiles }) {
    const { user } = useAuth();
    // Hardcoded values
    const messages = 42;
    const recordedTests = 17;
    const newTests = 5;

    return (
        <div className="p-6 bg-surface-50 rounded-2xl shadow-lg">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex items-center p-4">
                    <FaEnvelope className="text-blue-500 text-3xl mr-4" />
                    <div>
                        <p className="text-lg font-semibold">{messages}</p>
                        <span className="text-gray-500">Messages</span>
                    </div>
                </div>
                <div className="flex items-center p-4">
                    <FaCheckCircle className="text-green-500 text-3xl mr-4" />
                    <div>
                        <p className="text-lg font-semibold">{recordedTests}</p>
                        <span className="text-gray-500">Recorded Tests</span>
                    </div>
                </div>
                <div className="flex items-center p-4">
                    <FaClipboardList className="text-yellow-500 text-3xl mr-4" />
                    <div>
                        <p className="text-lg font-semibold">{newTests}</p>
                        <span className="text-gray-500">New Tests to Review</span>
                    </div>
                </div>
            </div>
        </div>
    );
}