
export default async function Announcements() {
    const response = await fetch("http://localhost:8000/db/announcements", {
        method: 'GET'
    });
    const data = await response.json();
    const announcements = data.data || [];

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
            {announcements.length === 0 ? (
                <div className="bg-white shadow-sm rounded-lg p-6 text-center border border-surface-200">
                    <div className="text-gray-400 mb-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                        </svg>
                    </div>
                    <p className="text-gray-600 font-medium">No announcements yet</p>
                    <p className="text-gray-500 text-sm mt-1">Check back later for updates</p>
                </div>
            ) : (
                <div className="bg-white shadow-sm rounded-lg overflow-hidden border border-surface-200">
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
                </div>
            )}
        </div>
    )
}