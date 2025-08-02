'use client'

import { useEffect, useState } from "react";

export default function Announcements() {
    const [announcements, setAnnouncements] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        async function fetchAnnouncements() {
            try {
                const response = await fetch("http://0.0.0.0:8000/db/announcements", {
                    method: 'GET'
                });
                const data = await response.json();
                setAnnouncements(data.data || []);
            } catch (error) {
                setError(error.message);
                setAnnouncements([]);
            }
            finally {
                setLoading(false);
            }
        }
        fetchAnnouncements()
    }, []);

    // Rest of component remains unchanged
    const formatDate = (dateString) => {
        const date = new Date(dateString)
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    return (
        <div className={'p-4 bg-surface-50 rounded-xl shadow-sm'}>
            {/* Header */}
            <div className="flex items-center justify-between mb-2">
                <h2 className="text-xl font-bold">Announcements</h2>
            </div>

            {/* Content area */}
            <div className="bg-white shadow-sm rounded-lg overflow-hidden border border-surface-200">
                {loading ? (
                    <div className="p-4 text-center">Loading announcements...</div>
                ) : error ? (
                    <div className="p-4 text-center text-red-500">{error}</div>
                ) : announcements.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">No announcements available</div>
                ) : (
                    <ul className="divide-y divide-gray-100">
                        {announcements.map((announcement, index) => (
                            <li key={index} className="hover:bg-gray-50 transition-colors duration-150 ease-in-out">
                                <div className="flex items-center justify-between p-4">
                                    <div className="flex flex-col flex-grow pr-4">
                                        <p className="font-semibold text-gray-800">
                                            {announcement.title}
                                        </p>
                                        <p className="text-sm text-gray-600 mt-1">{announcement.message}</p>
                                    </div>
                                    <div className="text-xs text-gray-500 whitespace-nowrap">
                                        {formatDate(announcement.created_at)}
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    )
}