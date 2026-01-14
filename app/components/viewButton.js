/**
 * ViewButton Component
 * A button component that allows users to view a specific test by setting the review data via the Electron API
 * and navigating to the reviewer page for that test.
 * Props:
 * - test: The test object containing details like test_name, id, etc.
 */
'use client'

import { useRouter } from "next/navigation";

export default function ViewButton({ test }) {
    const router = useRouter();

    // Function to handle viewing a test: sets review data via Electron API and navigates to the reviewer page
    const handleView = async (testName, file) => {
        try {
            await window.electronAPI.setReviewData(file);
            router.push('/reviewer/' + file.id);
        } catch (err) {
            console.error("Error viewing file:", err);
        }
    };

    return (
        <button
            onClick={() => handleView(test.test_name, test)}
            className="cursor-pointer hover:underline text-primary-500 text-sm"
        >
            View
        </button>
    );
}