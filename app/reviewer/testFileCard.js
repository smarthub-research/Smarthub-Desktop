'use client';

import DownloadButton from "./downloadButton";
import ViewButton from "./viewButton";

export default function TestFileCard({ testFile }) {
    return (
        <div className="bg-white rounded-lg p-4 hover:bg-gray-100 transition-colors">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="md:w-1/4">
                    <h3 className="font-bold text-xl">
                        {testFile.test_name || "Unnamed Test"}
                    </h3>
                    {testFile.created_at && (
                        <p className="text-gray-400 text-sm">
                            {new Date(testFile.created_at).toLocaleDateString()}
                        </p>
                    )}
                </div>

                <div className="md:w-1/4">
                    <p className="font-semibold text-sm text-gray-700">Comments</p>
                    <p className="text-gray-400 text-sm line-clamp-1">
                        {testFile.comments || "No comments"}
                    </p>
                </div>

                <div className="md:w-1/4">
                    <p className="font-semibold text-sm text-gray-700">Distance</p>
                    <p className="text-gray-400 text-sm">
                        {testFile.distance ? `${testFile.distance}` : "N/A"}
                    </p>
                </div>

                <div className="flex gap-2">
                    <DownloadButton testFile={testFile} />
                    <ViewButton testFile={testFile} />
                </div>
            </div>
        </div>
    );
}