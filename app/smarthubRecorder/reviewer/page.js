'use client';
import { useRouter } from 'next/navigation';
import useFetchFlags from '../hooks/useFetchFlags';
import { FiArrowLeft } from 'react-icons/fi';
import { TestProvider, useTest } from '../context/testContext';
import FlagSection from "./flagSection";
import TestMetrics from "./testMetrics";
import TestInformation from "./testInformation";
import ChartReview from "./chartReview";
import DownloadCSV from "./downloadCSV";
import SaveTest from "./saveTest";

// Main component for the Reviewer page
function ReviewerContent() {
    const router = useRouter();
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
        <div className="h-full w-full flex flex-col text-white p-6 pt-8 overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
                {/* Back button */}
                <div className="flex items-center">
                    <button
                        onClick={() => router.push('/smarthubRecorder/recorder/')}
                        className="mr-4 p-2 rounded-full hover:bg-gray-800 transition-colors"
                    >
                        <FiArrowLeft size={20} />
                    </button>
                    <h1 className="text-3xl font-bold">Review Test</h1>
                </div>

                <div className="flex gap-3">
                    <DownloadCSV />
                    <SaveTest allFlags={allFlags} />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <ChartReview />
                    <FlagSection allFlags={allFlags} />
                </div>

                <div className="space-y-6">
                    <TestInformation />
                    <TestMetrics />
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
