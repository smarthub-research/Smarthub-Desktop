'use client'
import Link from "next/link";
import {FiArrowLeft} from "react-icons/fi";
import React, {useState} from "react";

export default function TestName({setTestData, testData, id}) {
    const [changingTestName, setChangingTestName] = useState(false);
    const [updatedTestName, setUpdatedTestName] = useState("");

    const handleUpdateTestName = async () => {
        try {
            await window.electronAPI.updateTestName(id, updatedTestName);
            // Update local state to reflect the change
            setTestData({
                ...testData,
                test_name: updatedTestName
            });
            setChangingTestName(false);
        } catch (err) {
            console.error("Error updating test name:", err);
        }
    };

    return (
        <div className="flex items-center">
            <Link
                href="/smarthubReviewer"
                className="mr-4 p-2 rounded-full hover:bg-gray-800 transition-colors"
            >
                <FiArrowLeft className={'scale-150'}/>
            </Link>
            <h1 className="text-3xl font-bold hover:underline flex items-center h-[40px]" onDoubleClick={() => setChangingTestName(true)}>
                {changingTestName ? (
                    <input
                        type="text"
                        value={updatedTestName}
                        onChange={(e) => setUpdatedTestName(e.target.value)}
                        onBlur={handleUpdateTestName}
                        placeholder={testData.test_name}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                handleUpdateTestName();
                            }
                        }}
                        autoFocus
                        className="border-none text-white bg-transparent p-0 m-0 w-full h-full text-3xl font-bold focus:outline-none focus:underline"
                    />
                ) : (
                    testData?.test_name || "Unnamed Test"
                )}
            </h1>
        </div>
    )
}