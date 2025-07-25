import ViewButton from "./viewButton";

// Displays 10 of the most recent tests
export default function RecentTests({testFiles}) {
    return (
        <div className={'p-4 bg-surface-50 rounded-xl shadow-sm'}>
            {/* Header + Number of tests showing */}
            <div className="flex items-center justify-between mb-2 pr-1">
                <h2 className="text-xl font-bold">Recent Tests</h2>
                <span className="text-sm opacity-50">{testFiles.length} tests</span>
            </div>

            {/* List of the test files or an error message */}
            <div className="bg-white shadow-sm rounded-lg overflow-hidden border border-surface-200">
                {testFiles.length === 0 ? (
                    <div className="p-6 text-center opacity-50">No recent tests found</div>
                ) : (
                    <ul className="divide-y divide-gray-100">
                        {testFiles.map((test, index) => (
                            <li key={index} className="hover:bg-white transition-colors duration-150 ease-in-out">
                                <div className="flex items-center justify-between p-4">
                                    <div className="flex flex-col">
                                        <p className="font-semibold text-gray-800">{test.test_name}</p>
                                        <p className="text-xs opacity-50 mt-1">
                                            {/* Prints the date in Month Day, Year form */}
                                            {new Date(test.created_at).toLocaleDateString(undefined, {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric'
                                            })}
                                        </p>
                                    </div>
                                    <div className="flex items-center">
                                        <ViewButton test={test}/>
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