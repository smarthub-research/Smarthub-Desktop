
export default function Announcements() {
    const announcements = [
        {
            title: "fake news",
            author: 'KG',
            date: '6-23-2025',
            content: 'new announcement feature added!'
        },
        {
            title: "more fake news",
            author: 'KG',
            date: '6-23-2025',
            content: 'more new announcement feature added!'
        },
    ]
    return (
        <div className={'p-4 bg-surface-50 rounded-xl shadow-sm'}>
            {/* Header + Number of tests showing */}
            <div className="flex items-center justify-between mb-2">
                <h2 className="text-xl font-bold">Announcements</h2>
            </div>

            {/* List of the test files or an error message */}
            <div className="bg-white shadow-sm rounded-lg overflow-hidden border border-surface-200">
                <ul className="divide-y divide-gray-100">
                    { announcements.map((announcement, index) => (
                        <li key={index} className="hover:bg-white transition-colors duration-150 ease-in-out">
                            <div className="flex items-center justify-between p-4">
                                <div className="flex flex-col">
                                    <p className="font-semibold text-gray-800">{announcement.title}</p>
                                    <p className="text-xs opacity-50 mt-1">{announcement.content}</p>
                                </div>
                                <div className="flex items-center">
                                    <p className="text-xs opacity-50 mt-1">{announcement.date}</p>
                                </div>
                            </div>

                        </li>
                    ))}
                </ul>
            </div>
        </div>
    )
}