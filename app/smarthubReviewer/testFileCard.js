'use client';

import { FiDownload } from "react-icons/fi";

export default function TestFileCard({ file, onDownload, onView }) {
    return (
        <div className="bg-white rounded-lg p-4 hover:bg-gray-100 transition-colors">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="md:w-1/4">
                    <h3 className="font-bold text-xl">
                        {file.test_name || "Unnamed Test"}
                    </h3>
                    {file.created_at && (
                        <p className="text-gray-400 text-sm">
                            {new Date(file.created_at).toLocaleDateString()}
                        </p>
                    )}
                </div>

                <div className="md:w-1/4">
                    <p className="font-semibold text-sm text-gray-700">Comments</p>
                    <p className="text-gray-400 text-sm line-clamp-1">
                        {file.comments || "No comments"}
                    </p>
                </div>

                <div className="md:w-1/4">
                    <p className="font-semibold text-sm text-gray-700">Distance</p>
                    <p className="text-gray-400 text-sm">
                        {file.distance ? `${file.distance}` : "N/A"}
                    </p>
                </div>

                <div className="flex gap-2">
                    <button
                        className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded flex items-center gap-2 transition-colors cursor-pointer"
                        onClick={() => onDownload(file.test_name, file)}
                    >
                        <FiDownload size={16} />
                        <span>Download</span>
                    </button>

                    <button
                        className="bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded transition-colors cursor-pointer"
                        onClick={() => onView(file.test_name, file)}
                    >
                        View
                    </button>
                </div>
            </div>
        </div>
    );
}