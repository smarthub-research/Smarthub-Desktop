import React from "react";

export default function ChartToolbar(props) {
    const { dataPointCount, setDataPointCount, scrollPosition, setScrollPosition, data, graphId } = props;

    const handleScrollLeft = () => {
        if (scrollPosition < data.length - dataPointCount) {
            setScrollPosition(prev => prev + Math.floor(dataPointCount / 2));
        }
    };

    const handleScrollRight = () => {
        setScrollPosition(prev => Math.max(0, prev - Math.floor(dataPointCount / 2)));
    };

    const resetView = () => {
        setScrollPosition(0);
    };

    return (
        <div className="flex items-center space-x-4">
            {dataPointCount !== 0 && data && data.length > dataPointCount && (
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
                        {Math.max(1, data.length - scrollPosition - dataPointCount + 1)}-
                        {Math.min(data.length, data.length - scrollPosition)}
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
            )}
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
                    <option value="0">All</option>
                    <option value="10">10</option>
                    <option value="25">25</option>
                    <option value="50">50</option>
                    <option value="100">100</option>
                    <option value="200">200</option>
                </select>
            </div>
        </div>
    )
}