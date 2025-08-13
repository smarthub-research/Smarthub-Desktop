import {Card, CardContent, CardHeader, CardTitle} from "./ui/card";
import BellSVG from "./svg/bellSVG";

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
        <Card>
            <CardHeader>
                <CardTitle className="text-base">Announcements</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                { !announcements ? (
                    <div className="p-4 text-center">
                        <div className="text-gray-400 mb-3">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                            </svg>
                        </div>
                        <p className="text-gray-600 font-medium">No announcements yet</p>
                        <p className="text-gray-500 text-sm mt-1">Check back later for updates</p>
                    </div>
                ) : (
                    <>
                    {announcements.map((announcement, index) => (
                            <div key={index} className="space-y-2">
                                <div className="flex items-start gap-3">
                                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10">
                                        <BellSVG />
                                    </div>
                                    <div className="flex-1 space-y-1">
                                        <p className="text-sm font-medium">{announcement.title}</p>
                                        <p className="text-xs text-muted-foreground">{announcement.message}</p>
                                        <p className="text-xs text-muted-foreground">{formatDate(announcement.created_at)}</p>
                                    </div>
                                </div>
                                {index < announcements.length - 1 && <br />}
                            </div>
                    ))}
                    </>
                )}

            </CardContent>
        </Card>
    )
}