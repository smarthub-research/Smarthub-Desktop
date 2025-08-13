import CalendarSVG from "./svg/calendarSVG";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "./ui/card";

export default function Calendar() {
    return (
        <Card className="cursor-pointer transition-all hover:shadow-md hover:scale-[1.02]">
            <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-900">
                        <CalendarSVG margin={0}/>
                    </div>
                    <CardTitle className="text-base">Calendar</CardTitle>
                </div>
            </CardHeader>
            <CardContent>
                <CardDescription>Schedule and manage test sessions</CardDescription>
            </CardContent>
        </Card>
    )
}