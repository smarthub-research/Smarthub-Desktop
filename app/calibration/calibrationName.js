
// Input form for the calibrationName only active before the recording has begun
export default function CalibrationName({calibrationStep, calibrationName, setCalibrationName}) {
    return (
        <div>
            <label className="block text-sm font-medium mb-2">
                Calibration Name
            </label>
            <input
                type="text"
                value={calibrationName}
                onChange={(e) => setCalibrationName(e.target.value)}
                placeholder="Enter calibration name..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                disabled={calibrationStep !== ('idle' || 'connecting')}
            />
        </div>
    )
}