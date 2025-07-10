export default function Upcoming() {
    // Mock data for upcoming events
    const upcomingEvent = {
        title: "Checkup - John Doe",
        date: new Date(2023, 6, 15, 10, 30),
        type: "Checkup",
        doctor: "Dr. Smith",
        location: "Room 302"
    };

    return (
        <div className={'p-4 h-full flex flex-col'}>
            <h2 className="text-sm font-medium mb-2">Upcoming:</h2>
            <h3 className="font-bold text-blue-600">{upcomingEvent.title}</h3>
            <div className="text-sm mt-2 space-y-1">
                <p><span className="text-gray-500">Date:</span> {upcomingEvent.date.toLocaleDateString()}</p>
                <p><span className="text-gray-500">Time:</span> {upcomingEvent.date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                <p><span className="text-gray-500">Type:</span> {upcomingEvent.type}</p>
            </div>
        </div>
    );
}