
export default function Timer({recordingState, recordingTime}) {
    return (
        <div className="flex  items-center justify-center h-full rounded-lg px-6 py-2 ">
            {recordingState.isRecording ? (
                <div className="flex items-center">
                    <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse mr-2"></span>
                    <span className="text-sm font-medium">
                        Recording: {recordingTime.toFixed(1)}s
                    </span>
                </div>
            ) : (
                <div className="flex items-center text-gray-400">
                    <span className="h-2 w-2 rounded-full bg-gray-500 mr-2"></span>
                    <span className="text-sm font-medium">
                        {recordingTime.toFixed(1) > 0 ? ("Not Recording " + recordingTime.toFixed(1) + "s") : ("Not recording")}
                    </span>
                </div>
            )}
        </div>
    )
}