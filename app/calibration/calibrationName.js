// Simple input component for providing a calibration name.
// Props:
// - `calibrationStep` (string): current step in the calibration flow.
// - `calibrationName` (string): current value shown in the input.
// - `setCalibrationName` (fn): setter to update the name in parent state.
// Note: the `disabled` prop is intended to disable editing once the
// recording has started. The existing expression uses `('idle' ||
// 'connecting')` which evaluates to `'idle'` — keep this in mind if you
// refactor the enabling/disabling behavior.
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