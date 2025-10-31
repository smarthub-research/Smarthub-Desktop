'use client';
import useFetchFlags from '../hooks/useFetchFlags';
import { useTest } from '../context/testContext';
import TestInformation from "./testInformation";
import ChartReview from "./chartReview";
import SaveTest from "./saveTest";
import { useEffect } from 'react';

// Main component for the ReviewerTab page
function ReviewerContent() {
    const { isLoading } = useTest();

    useEffect(() => {
        const handleKeyDown = (e) => {
            // Prevent F5, Ctrl+R, Cmd+R refreshes
            if (e.key === 'F5' || (e.ctrlKey && e.key === 'r') || (e.metaKey && e.key === 'r')) {
                e.preventDefault();
            }
        };

        const handleBeforeUnload = (e) => {
            // Prevent page unload/refresh
            e.preventDefault();
            e.returnValue = '';
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, []);

    if (isLoading) {
        return (
            <div className="h-full w-full flex items-center justify-center">
                <div className="w-12 h-12 rounded-full border-4 border-t-blue-500 border-r-transparent border-b-blue-500 border-l-transparent animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="h-full w-full grow flex gap-2 flex-col p-6 overflow-y-auto mt-16">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <ChartReview />
                    {/*<FlagSection allFlags={allFlags} />*/}
                </div>

                <div className="space-y-6">
                    <TestInformation />
                    {/*<TestMetrics />*/}
                </div>
            </div>
        </div>
    );
}

export default function Reviewer() {
    return (
        <ReviewerContent />
    );
}
