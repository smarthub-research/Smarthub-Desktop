import {FiFilter} from "react-icons/fi";

export default function SearchFilters({handleFilterChange, filters}) {
    return (
        <div className="flex flex-col gap-4 md:w-64 bg-white rounded-lg p-4 h-fit shadow-md">
            {/* SEARCH BAR */}
            <div>
                <input
                    type="text"
                    placeholder="Search test files..."
                    className="w-full bg-white p-2 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>

            <div className="flex items-center gap-2 mb-4 border-b border-gray-700 pb-2">
                <FiFilter className="text-blue-500" />
                <h2 className="text-xl font-semibold">Filters</h2>
            </div>

            <div className="space-y-3">
                <div className="flex items-center">
                    <input
                        type="checkbox"
                        id="testNameFilter"
                        className="mr-2 h-4 w-4 accent-blue-500"
                        checked={filters.testName}
                        onChange={() => handleFilterChange('testName')}
                    />
                    <label htmlFor="testNameFilter">Test Name</label>
                </div>

                <div className="flex items-center">
                    <input
                        type="checkbox"
                        id="dateFilter"
                        className="mr-2 h-4 w-4 accent-blue-500"
                        checked={filters.date}
                        onChange={() => handleFilterChange('date')}
                    />
                    <label htmlFor="dateFilter">Date</label>
                </div>

                <div className="flex items-center">
                    <input
                        type="checkbox"
                        id="commentsFilter"
                        className="mr-2 h-4 w-4 accent-blue-500"
                        checked={filters.comments}
                        onChange={() => handleFilterChange('comments')}
                    />
                    <label htmlFor="commentsFilter">Comments</label>
                </div>
            </div>
        </div>
    )
}