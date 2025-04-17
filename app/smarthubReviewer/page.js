'use client'

import { useState, useEffect } from "react";
import { FiDownload, FiFilter } from "react-icons/fi";
import Link from "next/link";
import {useRouter} from "next/navigation";

export default function ReviewerHomePage() {
    const router = useRouter();
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState({
        testName: false,
        date: false,
        comments: false
    });

    useEffect(() => {
        async function loadFiles() {
            try {
                if (!window.electronAPI) {
                    throw new Error("Electron API is not available");
                }
                const response = await window.electronAPI.fetchTestFiles();
                console.log(response.data)
                setFiles(response.data || []);
            } catch (err) {
                console.error("Error fetching files:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        loadFiles();
    }, []);

    const handleFilterChange = (filter) => {
        setFilters(prev => ({
            ...prev,
            [filter]: !prev[filter]
        }));
    };

    const handleDownload = async (testName, file) => {
        try {
            await window.electronAPI.setTestData(file)
            await window.electronAPI.downloadCSV(testName);
        } catch (err) {
            console.error("Error downloading file:", err);
        }
    };

    const handleView = async (testName, file) => {
        try {
            await window.electronAPI.setReviewData(file)
            router.push('/smarthubReviewer/' + file.id);
        } catch (err) {
            console.error("Error viewing file:", err);
        }
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-[#121212]">
                <div className="text-white text-xl">Loading test files...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-[#121212]">
                <div className="bg-[#1a1a1a] p-6 rounded-lg shadow-lg text-red-400">
                    <h2 className="text-xl font-bold mb-2">Error</h2>
                    <p>{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#121212] text-white p-6">
            <Link href={'/'}>
                <h1 className="text-2xl mb-8 text-center tracking-wider border-b border-gray-700 pb-4">
                    SmartHub Reviewer
                </h1>
            </Link>


            <div className="flex flex-col md:flex-row gap-6">

                {/* FILTERS SIDEBAR */}
                <div className="flex flex-col gap-4 md:w-64 bg-[#1a1a1a] rounded-lg p-4 h-fit">
                    {/* SEARCH BAR */}
                    <div>
                        <input
                            type="text"
                            placeholder="Search test files..."
                            className="w-full bg-[#1a1a1a] text-white p-2 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
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

                {/* FILE LIST */}
                <div className="flex-1">
                    <div className={'flex flex-row gap-4'}>
                        <div className={'flex grow flex-col bg-[#1a1a1a] rounded-lg p-4 mb-4 justify-between'}>
                            <p>Number of tests</p>
                            <p>{files.length}</p>
                        </div>

                        <div className={'flex grow flex-col bg-[#1a1a1a] rounded-lg p-4 mb-4 justify-between'}>
                            <p>____</p>
                            <p>____</p>
                        </div>

                        <div className={'flex grow flex-col bg-[#1a1a1a] rounded-lg p-4 mb-4 justify-between'}>
                            <p>something else</p>
                            <p>____</p>
                        </div>
                    </div>

                    {files && files.length > 0 ? (
                        <div className="space-y-4">
                            {files.map((file, index) => (
                                <div
                                    key={index}
                                    className="bg-[#1a1a1a] rounded-lg p-4 hover:bg-[#242424] transition-colors"
                                >
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        <div className="md:w-1/4">
                                            <h3 className="font-bold text-xl">
                                                {file.test_name || "Unnamed Test"}
                                            </h3>
                                            {file.created_at && (
                                                <p className="text-gray-400 text-sm">
                                                    {new Date(file.created_at).toLocaleDateString()}
                                                </p>
                                            )}
                                        </div>

                                        <div className="md:w-1/4">
                                            <p className="font-semibold text-sm text-gray-300">Comments</p>
                                            <p className="text-gray-400 text-sm line-clamp-1">
                                                {file.comments || "No comments"}
                                            </p>
                                        </div>

                                        <div className="md:w-1/4">
                                            <p className="font-semibold text-sm text-gray-300">Distance</p>
                                            <p className="text-gray-400 text-sm">
                                                {file.distance ? `${file.distance}` : "N/A"}
                                            </p>
                                        </div>

                                        <div className="flex gap-2">
                                            <button
                                                className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded flex items-center gap-2 transition-colors cursor-pointer"
                                                onClick={() => handleDownload(file.test_name, file)}
                                            >
                                                <FiDownload size={16} />
                                                <span>Download</span>
                                            </button>

                                            <button
                                                className="bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded transition-colors cursor-pointer"
                                                onClick={() => handleView(file.test_name, file)}
                                            >
                                                View
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-[#1a1a1a] rounded-lg p-8 text-center">
                            <p className="text-gray-400 text-lg mb-4">No test files available.</p>
                            <button
                                className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-lg transition"
                                onClick={() => window.location.href = "/smarthubRecorder"}
                            >
                                Create New Test
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}