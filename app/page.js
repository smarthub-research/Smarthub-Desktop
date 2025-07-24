'use client'

import RecentTests from "./components/recentTests";
import Analytics from "./components/analytics/analytics";
import Services from "./components/services";
import {useEffect, useState} from "react";
import Announcements from "./components/announcements";
import { useAuth } from "./auth/authContext";
import {useRouter} from "next/navigation";
import Splash from "./components/splash";
import Loader from "./components/loader";

export default function Dashboard() {
    const router = useRouter();
    const [testFiles, setTestFiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const {user, loading: authLoading} = useAuth();

    useEffect(() => {
        const fetchTestFiles = async () => {
            try {
                console.log("Fetching test files...");
                const response = await window.electronAPI.fetchTestFilesAmount(10);
                const data = response.data;
                setTestFiles(data || []);
                console.log("Test files fetched:", data?.length || 0);
            } catch (error) {
                console.error('Error fetching recent tests:', error);
                setTestFiles([]); // Set empty array on error
            } finally {
                setLoading(false);
            }
        }

        fetchTestFiles();
    }, []);

    useEffect(() => {
        if (!authLoading && !user) {
            console.log("Not authenticated, redirecting to login");
            router.push('/auth/login');
        }
    }, [user, authLoading, router]);

    if (loading || authLoading) {
        return (
            <div className={'h-screen w-screen'}>
                <Loader/>
            </div>
        );
    }

    if (!user) {
        return <Splash/>;
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