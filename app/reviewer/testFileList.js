import TestFileCard from "./testFileCard";
import Link from "next/link";

export default async function TestFileList({filters, searchTerm}) {
    const response = await fetch("http://localhost:8000/db/tests", {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    });
    const data = await response.json();
    const testFiles = data.data || []

    return (
        <>
            {(testFiles && testFiles.length > 0) ? (
                <div className="space-y-4">
                    {testFiles.map((testFile, index) => (
                        <TestFileCard
                            key={index}
                            testFile={testFile}
                        />
                    ))}
                </div>
            ) : (
                <div className="bg-white rounded-lg p-8 text-center">
                    <p className="text-gray-400 text-lg mb-4">No test files available.</p>
                    <Link
                        className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-lg transition"
                        href={"/recorder"}
                    >
                        Create New Test
                    </Link>
                </div>
            )}
        </>
    )
}