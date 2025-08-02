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
        const fetchTestFiles = async () => {
            try {
                const response = await fetch("http://localhost:8000/db/tests", {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                const data = await response.json();
                setTestFiles(data.data.slice(0, (10 || data.data.length - 1)) || []);
            } catch (error) {
                console.error('Error fetching recent tests:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchTestFiles();
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