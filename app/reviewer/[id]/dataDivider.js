export default function DataDivider({testData}) {
    return (
        <div className={'grid grid-cols-4 justify-around text-center items-center w-full p-4 bg-white shadow-md rounded-lg divide-x divide-surface-300'}>
            <div className={'px-6'}>
                <p className={'opacity-75 text-sm'}>Time Elapsed</p>
                <p className={'font-semibold text-xl'}>{(Number(testData.test_files.timeStamp.at(-1)) / 1000).toFixed(2)}s</p>
            </div>
            <div className={'px-6'}>
                <p className={'opacity-75 text-sm'}>Distance</p>
                <p className={'font-semibold text-xl'}>{testData.test_files.distance || "No distance recorded"}</p>
            </div>
            <div className={'px-6'}>
                <p className={'opacity-75 text-sm'}>Flags</p>
                <p className={'font-semibold text-xl'}>{testData.flags ? testData.flags.length : 0}</p>
            </div>
            <div className={'px-6'}>
                <p className={'opacity-75 text-sm'}>Data Points</p>
                <p className={'font-semibold text-xl'}>{testData.test_files.timeStamp.length}</p>
            </div>
        </div>
    )
}