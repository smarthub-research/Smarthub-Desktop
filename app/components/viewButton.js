'use client'

import { useRouter } from "next/navigation";

export default function ViewButton({ test }) {
    const router = useRouter();

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