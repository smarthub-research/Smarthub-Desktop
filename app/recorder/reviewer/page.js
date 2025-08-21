'use client';
import useFetchFlags from '../hooks/useFetchFlags';
import { TestProvider, useTest } from '../context/testContext';
import TestInformation from "./testInformation";
import ChartReview from "./chartReview";
import SaveTest from "./saveTest";

// Main component for the ReviewerTab page
function ReviewerContent() {
    const [allFlags] = useFetchFlags();
    const { isLoading } = useTest();

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
        // Provides context for the test data
        <TestProvider>
            <ReviewerContent />
        </TestProvider>
    );
}
