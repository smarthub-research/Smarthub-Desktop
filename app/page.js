'use client'

import { useState, useEffect } from 'react';
import RecentTests from "./components/recentTests";
import Analytics from "./components/analytics/analytics";
import Services from "./components/services";
import Announcements from "./components/announcements";
import Loader from "./components/loader";

export default function DashboardClient() {
    const [testFiles, setTestFiles] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await window.electronAPI.fetchTestFilesAmount(10);
                setTestFiles(response.data || []);
            } catch (error) {
                console.error('Error fetching recent tests:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return (
            <div className={'h-screen w-screen'}>
                <Loader/>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full w-full p-6 lg:p-10 gap-6 bg-surface-200">
            <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
                <div className="flex flex-col gap-4 lg:col-span-2">
                    <Analytics testFiles={testFiles}/>
                    <Services/>
                </div>
                <div className="flex flex-col gap-4 lg:col-span-1">
                    <RecentTests testFiles={testFiles.slice(0, 10)}/>
                    <Announcements/>
                </div>
            </div>
        </div>
    );
}