
// Displays the current date and time in a specific format of the test
export default function TestDate() {
    return (
        <div>
            <label className="block mb-2 text-sm font-medium opacity-50">
                Test Date
            </label>
            <div className="w-full bg-white border border-gray-500 rounded-lg p-3">
                {new Date().toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                })}
            </div>
        </div>
    )
}