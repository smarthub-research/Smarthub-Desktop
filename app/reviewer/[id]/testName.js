'use client'

import React, {useState} from "react";
import {FiArrowLeft} from "react-icons/fi";
import Link from "next/link";

export default function TestName({ testData, id }) {
    const [changingTestName, setChangingTestName] = useState(false);
    const [updatedTestName, setUpdatedTestName] = useState("");

    const handleUpdateTestName = async () => {
        try {
            const response = await fetch("http://localhost:8000/db/update_test/" + id, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    test_name: updatedTestName
                })
            })
            testData.test_name = updatedTestName;
            console.log(response)
            setChangingTestName(false);
        } catch (err) {
            console.error("Error updating test name:", err);
        }
    };

    return (
        <div className="flex items-center">
            <Link
                href="/reviewer"
                className="mr-4 p-2 rounded-full hover:bg-surface-300 transition-colors"
            >
                <FiArrowLeft className={'scale-150'}/>
            </Link>
            <h1 className="text-3xl font-bold hover:cursor-pointer flex items-center" onDoubleClick={() => setChangingTestName(true)}>
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
                        className="border-none text-black bg-transparent p-0 m-0 w-full h-full text-3xl font-bold focus:outline-none"
                    />
                ) : (
                    testData?.test_name || "Unnamed Test"
                )}
            </h1>
        </div>
    )
}