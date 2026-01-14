'use client';
import { useState, useEffect } from 'react';
import RecentTests from "./components/recentTests";
import Services from "./components/services";
import { useAuth } from "./auth/authContext";
import SmoothVsUnsmooth from './components/graphs/smoothVsUnsmooth';

/**
 * DashboardClient
 * Client-side dashboard entry. Depends on `useAuth()` to obtain the
 * authenticated user and then fetches recent test entries from the backend.
 * The fetch includes a bearer token from `localStorage` when available.
 */
export default function DashboardClient() {
    const { user, loading } = useAuth();
    const [testFiles, setTestFiles] = useState([]);
    const [testsLoading, setTestsLoading] = useState(false);

    useEffect(() => {
        // Only fetch tests if user is authenticated and not loading
        if (user && !loading) {
            const fetchTests = async () => {
                setTestsLoading(true);
                try {
                    const token = localStorage.getItem('access_token');
                    const response = await fetch(`http://localhost:8000/db/tests?page=1&limit=10`, {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        }
                    });
                    const data = await response.json();
                    setTestFiles(data.tests || []);
                } catch (error) {
                    console.log(error);
                    setTestFiles([]);
                } finally {
                    setTestsLoading(false);
                }
            };

            fetchTests();
        }
    }, [user, loading]);

    // Don't render anything while auth is loading or user is not authenticated
    if (loading || !user) {
        return null;
    }

    return (
        <div className="mt-12 flex flex-col h-[90dvh] w-full p-6 lg:p-10 gap-6 bg-surface-200">
            {/*<Analytics testFiles={testFiles} />*/}
            <div className='ml-16 flex flex-col gap-6'>
                <Services/>
                <RecentTests testFiles={testFiles} loading={testsLoading}/>
            </div>
        </div>
    );
}