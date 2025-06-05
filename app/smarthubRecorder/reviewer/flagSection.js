import {useTest} from "../context/testContext";

// Displays the flags added during the test
export default function FlagSection() {
    const { allFlags } = useTest()

    return (
        <div className="bg-[#1a1a1a] rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
                <span className="mr-2">Test Flags</span>
                <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">{allFlags?.length || 0}</span>
            </h2>

            {/* Displays a list of all of the flags recorded during the test */}
            <div className="max-h-[300px] overflow-y-auto pr-2">
                {allFlags && allFlags.length > 0 ? (
                    <div className="space-y-3">
                        {allFlags.map(flag => (
                            <div key={flag.id} className="bg-[#252525] p-3 rounded-lg border-l-4 border-blue-500">
                                <div className="flex justify-between mb-1">
                                                <span className="text-sm text-gray-400">
                                                    {flag.timestamp}
                                                </span>
                                    <span className="text-xs bg-gray-700 px-2 py-1 rounded-full">
                                                    Graph: {
                                        flag.graphId === 1 ? 'Displacement' :
                                            flag.graphId === 2 ? 'Heading' :
                                                flag.graphId === 3 ? 'Velocity' :
                                                    flag.graphId === 4 ? 'Trajectory' : 'Unknown'
                                    }
                                                </span>
                                </div>
                                <p className="text-white">{flag.comment}</p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-6 text-gray-400">
                        No flags were added during this test.
                    </div>
                )}
            </div>
        </div>
    )
}