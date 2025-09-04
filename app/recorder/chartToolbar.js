
// Component to create the toolbar for the chart
export default function ChartToolbar(props) {
    const { dataPointCount, setDataPointCount, scrollPosition, setScrollPosition, data, graphId } = props;

    // Allows scrolling left through the data points
    const handleScrollLeft = () => {
        // Calculate how much to scroll left
        const scrollAmount = Math.floor(dataPointCount / 2);

        // Calculate the maximum scroll position
        const maxScrollPosition = Math.max(0, data.length - dataPointCount);

        // Ensure we don't scroll beyond the dataset
        setScrollPosition(prev => Math.min(maxScrollPosition, prev + scrollAmount));
    };

    // Allows scrolling right through the data points
    const handleScrollRight = () => {
        // Calculate how much to scroll right
        const scrollAmount = Math.floor(dataPointCount / 2);
        setScrollPosition(prev => Math.max(0, prev - scrollAmount));
    };

    // Resets the scroll position to the start
    const resetView = () => {
        setScrollPosition(0);
    };

    return (
        <div className="flex items-center space-x-4">
            {dataPointCount !== 0 && data && data.length > dataPointCount && (
                <>
                <div className="flex items-center space-x-2">
                    <button
                        onClick={handleScrollLeft}
                        disabled={scrollPosition >= data.length - dataPointCount}
                        className={`p-1.5 rounded ${scrollPosition >= data.length - dataPointCount ? 'text-gray-600' : 'text-gray-300 hover:bg-gray-800'}`}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none"
                             viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                  d="M15 19l-7-7 7-7"/>
                        </svg>
                    </button>
                    <span className="text-xs text-gray-400">
                        {/* When scrollPosition is high, we're seeing older data */}
                        {scrollPosition >= data.length - dataPointCount ?
                            `1-${Math.min(dataPointCount, data.length)}` :
                            `${Math.max(1, data.length - scrollPosition - dataPointCount + 1)}-${data.length - scrollPosition}`
                        }
                    </span>
                    <button
                        onClick={handleScrollRight}
                        disabled={scrollPosition <= 0}
                        className={`p-1.5 rounded ${scrollPosition <= 0 ? 'text-gray-600' : 'text-gray-300 hover:bg-gray-800'}`}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none"
                             viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                  d="M9 5l7 7-7 7"/>
                        </svg>
                    </button>
                    <button
                        onClick={resetView}
                        className="text-xs px-2 py-1 bg-gray-800 text-gray-300 rounded hover:bg-gray-700"
                    >
                        Reset
                    </button>
                </div>

                {/* Displays the number of data points being shown as a dropdown */}
                <div className="flex items-center">
                    <label htmlFor={`dataPoints-${graphId}`} className="text-gray-400 mr-2 text-sm">
                        Data points:
                    </label>
                    <select
                        id={`dataPoints-${graphId}`}
                        value={dataPointCount}
                        onChange={(e) => {
                            setDataPointCount(Number(e.target.value));
                            setScrollPosition(0);
                        }}
                        className="bg-gray-900 text-white border border-gray-700 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                        {/* Number of data point options */}
                        <option value="0">All</option>
                        <option value="10">10</option>
                        <option value="25">25</option>
                        <option value="50">50</option>
                        <option value="100">100</option>
                        <option value="200">200</option>
                    </select>
                </div>
                </>
            )}

        </div>
    )
}