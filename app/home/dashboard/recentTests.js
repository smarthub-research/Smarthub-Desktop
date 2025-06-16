import { useEffect, useState } from "react";
import {useRouter} from "next/navigation";

// Displays 10 of the most recent tests
export default function RecentTests({testFiles}) {
    // Router so we can navigate to a specific test's review page
    const router = useRouter();

    // Handle viewing a specific test
    const handleView = async (testName, file) => {
        try {
            await window.electronAPI.setReviewData(file)
            router.push('/smarthubReviewer/' + file.id);
        } catch (err) {
            console.error("Error viewing file:", err);
        }
    }

    return (
        <div className={'p-4 bg-gray-50 rounded-xl shadow-sm'}>
            {/* Header + Number of tests showing */}
            <div className="flex items-center justify-between mb-4 pr-1">
                <h2 className="text-xl font-bold text-gray-800">Recent Tests</h2>
                <span className="text-sm text-gray-500">{testFiles.length} tests</span>
            </div>

            {/* List of the test files or an error message */}
            <div className="bg-white shadow-md rounded-lg overflow-hidden border border-gray-100">
                {testFiles.length === 0 ? (
                    <div className="p-6 text-center text-gray-500">No recent tests found</div>
                ) : (
                    <ul className="divide-y divide-gray-100">
                        {testFiles.map((test, index) => (
                            <li key={index} className="hover:bg-gray-50 transition-colors duration-150 ease-in-out">
                                <div className="flex items-center justify-between p-4">
                                    <div className="flex flex-col">
                                        <p className="font-semibold text-gray-800">{test.test_name}</p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            {/* Prints the date in Month Day, Year form */}
                                            {new Date(test.created_at).toLocaleDateString(undefined, {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric'
                                            })}
                                        </p>
                                    </div>
                                    <div className="flex items-center">
                                        {/* Navigate to the specific test */}
                                        <button onClick={() => handleView(test.test_name, test)}
                                            className="cursor-pointer hover:underline text-blue-600 hover:text-blue-800 text-sm">
                                            View
                                        </button>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}