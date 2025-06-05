import {useTest} from "../context/testContext";

// Component for specific test metrics
export default function TestMetrics() {
    const { testData } = useTest()

    return (
        <div className="bg-[#1a1a1a] rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Test Metrics</h2>

            <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#252525] p-4 rounded-lg">
                    <p className="text-gray-400 text-sm">Duration</p>
                    <p className="text-xl font-semibold">
                        {testData?.duration || '--'} sec
                    </p>
                </div>
                <div className="bg-[#252525] p-4 rounded-lg">
                    <p className="text-gray-400 text-sm">Max Velocity</p>
                    <p className="text-xl font-semibold">
                        {testData?.maxVelocity?.toFixed(2) || '--'} m/s
                    </p>
                </div>
                <div className="bg-[#252525] p-4 rounded-lg">
                    <p className="text-gray-400 text-sm">Data Points</p>
                    <p className="text-xl font-semibold">
                        {testData.displacement.length * 4 || '--'}
                    </p>
                </div>
                <div className="bg-[#252525] p-4 rounded-lg">
                    <p className="text-gray-400 text-sm">Avg. Heading</p>
                    <p className="text-xl font-semibold">
                        {testData?.avgHeading?.toFixed(2) || '--'}°
                    </p>
                </div>
            </div>
        </div>
    )
}