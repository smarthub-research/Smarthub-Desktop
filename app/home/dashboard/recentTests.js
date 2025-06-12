import { useEffect, useState } from "react";
import {useRouter} from "next/navigation";

// Displays 10 of the most recent tests
export default function RecentTests() {
    // Router so we can navigate to a specific test's review page
    const router = useRouter();

    const [tests, setTests] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Function to fetch the 10 most recent tests
        const fetchRecentTests = async () => {
            try {
                setLoading(true);
                const response = await window.electronAPI.fetchTestFilesAmount(10);
                const data = response.data;
                // If the response is nothing, set tests to an empty array
                setTests(data || []);
            } catch (error) {
                console.error('Error fetching recent tests:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchRecentTests();
    }, []);

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
        <div className="w-md">
            <div className="flex items-center justify-between mb-4 pr-1">
                <h2 className="text-xl font-bold text-gray-800">Recent Tests</h2>
                <span className="text-sm text-gray-500">{tests.length} tests</span>
            </div>

            <div className="bg-white shadow-md rounded-lg overflow-hidden border border-gray-100">
                {loading ? (
                    <div className="p-6 text-center text-gray-500">Loading tests...</div>
                ) : tests.length === 0 ? (
                    <div className="p-6 text-center text-gray-500">No recent tests found</div>
                ) : (
                    // List of recent tests
                    <ul className="divide-y divide-gray-100">
                        {tests.map((test, index) => (
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