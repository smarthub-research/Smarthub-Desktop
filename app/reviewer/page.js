'use client'

import { useState, useEffect } from "react";
import {useRouter} from "next/navigation";
import TestFileCard from "./testFileCard";
import SearchFilters from "./searchFilters";

export default function ReviewerHomePage() {
    const router = useRouter();
    const [files, setTestFiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState({
        testName: false,
        date: false,
        comments: false
    });

    useEffect(() => {
        const fetchTestFiles = async () => {
            try {
                const response = await fetch("http://localhost:8000/db/tests", {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                const data = await response.json();
                setTestFiles(data.data || [])
            } catch (error) {
                console.error('Error fetching recent tests:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchTestFiles();
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
            router.push('/reviewer/' + file.id);
        } catch (err) {
            console.error("Error viewing file:", err);
        }
    }

    if (loading) {
        return (
            <div className="flex grow w-full justify-center items-center min-h-screen">
                <div className="text-black text-xl">Loading test files...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex grow justify-center items-center min-h-screen bg-[#121212]">
                <div className="bg-[#1a1a1a] p-6 rounded-lg shadow-lg text-red-400">
                    <h2 className="text-xl font-bold mb-2">Error</h2>
                    <p>{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen grow p-6">
            <h1 className={'text-center font-bold text-2xl mb-4'}>Reviewer</h1>
            <div className="flex flex-col md:flex-row gap-6">

                {/* FILTERS SIDEBAR */}
                <SearchFilters filters={filters} handleFilterChange={handleFilterChange}/>

                {/* FILE LIST */}
                <div className="flex-1">
                    {files && files.length > 0 ? (
                        <div className="space-y-4">
                            {files.map((file, index) => (
                                <TestFileCard
                                    key={index}
                                    file={file}
                                    onDownload={handleDownload}
                                    onView={handleView}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white rounded-lg p-8 text-center">
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