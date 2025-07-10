import {useTest} from "../context/testContext";

// Component to set the test name
export default function TestNameInput() {
    const {testName, setTestName, formErrors, setFormErrors} = useTest()

    return (
        <div>
            <label className="block mb-2 text-sm font-medium opacity-50">
                Test Name
            </label>
            <input
                type="text"
                value={testName}
                onChange={(e) => {
                    setTestName(e.target.value);
                    // Clear error when user types
                    if (formErrors.testName) {
                        setFormErrors(prev => ({...prev, testName: false}));
                    }
                }}
                onBlur={(() => {
                    if (!testName.trim()) {
                        setFormErrors(prev => ({...prev, testName: true}));
                    }
                })}
                placeholder="Enter a name for this test"
                className={`w-full border ${
                    formErrors.testName
                        ? 'border-red-500 ring-1 ring-red-500'
                        : 'border-gray-500'
                } rounded-lg p-3 text-black focus:outline-none focus:ring-2 focus:${
                    formErrors.testName ? 'ring-red-500' : 'ring-blue-500'
                }`}
            />
            {/* Form errors when invalid name is entered */}
            {formErrors.testName && (
                <p className="text-red-500 text-sm mt-1">
                    Test name is required.
                </p>
            )}
        </div>
    )
}