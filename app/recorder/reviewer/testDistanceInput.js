import {useTest} from "../context/testContext";

// Component for inputting and displaying the test distance with unit selection.
// Purpose: Allows users to specify the distance covered during the test.
// Supports multiple units (meters, feet, kilometers, miles) for flexibility.
export default function TestDistanceInput() {
    const { testDistance, setTestDistance, unitType, setUnitType } = useTest()

    return (
        <div>
            <label className="block mb-2 text-sm font-medium opacity-50">
                Test Distance
            </label>
            <div className="flex">
                {/* Input field for distance value */}
                <input
                    type="number"
                    value={testDistance}
                    onChange={(e) => setTestDistance(e.target.value)}
                    placeholder="Distance"
                    className="flex-1 border bg-white border-gray-500 rounded-l-lg p-3 text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {/* Dropdown for selecting unit type */}
                <select
                    value={unitType}
                    onChange={(e) => setUnitType(e.target.value)}
                    className="border border-l-0 bg-white border-gray-500 rounded-r-lg px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value="m">m</option>
                    <option value="ft">ft</option>
                    <option value="km">km</option>
                    <option value="mi">mi</option>
                </select>
            </div>
        </div>
    )
}