'use client';
import useFetchFlags from '../hooks/useFetchFlags';
import { TestProvider, useTest } from '../context/testContext';
import TestMetrics from "./testMetrics";
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
        <div className="h-full w-full grow flex flex-col gap-4 p-6 pt-8 overflow-y-auto mt-8">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">Review Test</h1>
                <div className="flex gap-3">
                    {/*<DownloadCSV />*/}
                    <SaveTest allFlags={allFlags} />
                </div>
            </div>

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
