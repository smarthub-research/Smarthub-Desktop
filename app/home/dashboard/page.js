'use client'

import RecentTests from "./recentTests";
import Analytics from "./analytics/analytics";
import Services from "./services";
import {useEffect, useState} from "react";
import Loader from '../../loader'
import Announcements from "./announcements";

// Component to render the home dashboard page
export default function Dashboard({ setCurrentPage }) {
    const [testFiles, setTestFiles] = useState()
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchTestFiles = async () => {
            try {
                const response = await window.electronAPI.fetchTestFiles();
                const data = response.data;
                // If the response is nothing, set tests to an empty array
                setTestFiles(data || []);
            } catch (error) {
                console.error('Error fetching recent tests:', error);
            } finally {
                setLoading(false);
            }
        }
        fetchTestFiles()
    }, []);

    if (loading) {
        return (
            <Loader/>
        )
    }

    return (
        <div className="flex flex-col h-full p-6 lg:p-10 gap-6 bg-surface-200">
            {/*<h1 className="font-bold text-2xl">Welcome to Smarthub Desktop</h1>*/}
            <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
                {/* Left or center part of grid */}
                <div className="flex flex-col gap-4 lg:col-span-2">
                    <Analytics testFiles={testFiles}/>
                    {/* services */}
                    <Services setCurrentPage={setCurrentPage}/>
                </div>
                {/* right side of the grid */}
                <div className="flex flex-col gap-4 lg:col-span-1">
                    <RecentTests testFiles={testFiles.slice(0, 10)}/>
                    <Announcements />
                </div>
            </div>
        </div>
    );
}