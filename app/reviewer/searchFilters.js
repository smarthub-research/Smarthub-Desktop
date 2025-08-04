"use client";

import { FiFilter } from "react-icons/fi";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";

export default function SearchFilters({ filters }) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [searchTerm, setSearchTerm] = useState("");

    // Initialize search term from URL on component mount
    useEffect(() => {
        const currentSearch = searchParams.get("search") || "";
        setSearchTerm(currentSearch);
    }, [searchParams]);

    const handleFilterChange = (filter) => {
        // Create new URLSearchParams with current params
        const params = new URLSearchParams(searchParams.toString());

        // Toggle the filter value
        const newValue = filters[filter] ? 'false' : 'true';
        params.set(filter, newValue);

        // Update the URL with the new params
        router.push(`?${params.toString()}`);
    };

    const handleSearch = (e) => {
        const params = new URLSearchParams(searchParams.toString());

        if (searchTerm.trim()) {
            params.set("search", searchTerm);
        } else {
            params.delete("search");
        }

        router.push(`?${params.toString()}`);
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
            handleSearch();
        }
    };

    return (
        <div className="flex flex-col gap-4 md:w-64 bg-white rounded-lg p-4 h-fit shadow-md">
            {/* SEARCH BAR */}
            <div className="flex">
                <input
                    type="text"
                    placeholder="Search test files..."
                    className="w-full bg-white p-2 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={handleKeyDown}
                />
                <button
                    onClick={handleSearch}
                    className="ml-2 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
                    Search
                </button>
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