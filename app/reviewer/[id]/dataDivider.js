export default function DataDivider({testData, comparisonData}) {
    const renderStats = (data, label, isComparison = false) => {
        const timeElapsed = (Number(data.test_files.timeStamp.at(-1)) / 1000).toFixed(2);
        const distance = data.test_files.distance.at(-1).toFixed(2);
        const dataPoints = data.test_files.timeStamp.length;
        
        return (
            <div className={`grid grid-cols-3 justify-around text-center items-center w-full p-4 bg-white shadow-md rounded-lg divide-x divide-surface-300 ${isComparison && 'border-2 border-secondary-400'}`}>
                {label && (
                    <div className="col-span-3 pb-2 mb-2 border-b border-surface-200">
                        <p className="text-xs font-semibold uppercase tracking-wide">
                            {label}
                        </p>
                    </div>
                )}
                <div className={'px-6'}>
                    <p className={'opacity-75 text-sm'}>Time Elapsed</p>
                    <p className={'font-semibold text-xl'}>{timeElapsed}s</p>
                </div>
                <div className={'px-6'}>
                    <p className={'opacity-75 text-sm'}>Distance</p>
                    <p className={'font-semibold text-xl'}>{`${distance}m` || "No distance recorded"}</p>
                </div>
                <div className={'px-6'}>
                    <p className={'opacity-75 text-sm'}>Data Points</p>
                    <p className={'font-semibold text-xl'}>{dataPoints}</p>
                </div>
            </div>
        );
    };

    return (
        <div className="w-full flex flex-col gap-4">
            {comparisonData ? (
                <div className="grid grid-cols-2 gap-4">
                    {renderStats(testData, "Current Test", false)}
                    {renderStats(comparisonData, "Comparison Test", true)}
                </div>
            ) : (
                renderStats(testData, null, false)
            )}
        </div>
    )
}