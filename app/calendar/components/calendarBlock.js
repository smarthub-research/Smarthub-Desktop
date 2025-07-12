"use client"

import * as React from "react"
import { Calendar } from "./calendar"
import { Card, CardContent, CardHeader, CardTitle } from "./card"
import { Badge } from "./badge"
import { Clock, MapPin } from "lucide-react"

// Sample events data
const events = {
    "2025-06-12": [
        { id: "1", title: "Team Meeting", time: "10:00 AM", location: "Conference Room A", type: "meeting" },
        { id: "2", title: "Lunch with Sarah", time: "12:30 PM", location: "Downtown Cafe", type: "personal" },
    ],
    "2025-06-15": [{ id: "3", title: "Project Deadline", time: "5:00 PM", type: "work" }],
    "2025-06-18": [
        { id: "4", title: "Doctor Appointment", time: "2:00 PM", location: "Medical Center", type: "personal" },
        { id: "5", title: "Gym Session", time: "6:00 PM", location: "Fitness Club", type: "personal" },
        { id: "6", title: "Team Standup", time: "9:00 AM", type: "meeting" },
    ],
    "2025-06-22": [{ id: "7", title: "Birthday Party", time: "7:00 PM", location: "Home", type: "personal" }],
    "2025-06-25": [{ id: "8", title: "Client Presentation", time: "3:00 PM", location: "Office", type: "work" }],
}

const getEventTypeColor = (type) => {
    switch (type) {
        case "meeting":
            return "bg-blue-500"
        case "personal":
            return "bg-green-500"
        case "work":
            return "bg-orange-500"
        default:
            return "bg-gray-500"
    }
}

const getEventTypeBadgeColor = (type) => {
    switch (type) {
        case "meeting":
            return "bg-blue-100 text-blue-800 hover:bg-blue-100"
        case "personal":
            return "bg-green-100 text-green-800 hover:bg-green-100"
        case "work":
            return "bg-orange-100 text-orange-800 hover:bg-orange-100"
        default:
            return "bg-gray-100 text-gray-800 hover:bg-gray-100"
    }
}

export default function Calendar18() {
    const [date, setDate] = React.useState(new Date(2025, 5, 12))

    const formatDateKey = (date) => {
        return date.toISOString().split("T")[0]
    }

// Update getEventsForDate to handle undefined dates
    const getEventsForDate = (date) => {
        if (!date) return [];
        const dateKey = formatDateKey(date);
        return events[dateKey] || [];
    }

// Update hasEvents to handle undefined dates
    const hasEvents = (date) => {
        if (!date) return false;
        return getEventsForDate(date).length > 0;
    }

    const selectedDateEvents = date ? getEventsForDate(date) : []

    return (
        <div className="flex flex-col lg:flex-row gap-6 p-4">
            <div className="flex-shrink-0">
                <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    className="rounded-lg border [--cell-size:2.75rem] md:[--cell-size:3rem]"
                    buttonVariant="ghost"
                    components={{
                        Day: ({ date: dayDate, ...props }) => {
                            const hasEventsForDay = dayDate ? hasEvents(dayDate) : false;
                            const isSelected = date && dayDate &&
                                dayDate.toDateString() === date.toDateString();

                            return (
                                <td className="relative p-0">
                                    <div
                                        className="relative w-full h-full"
                                    >
                                        <div
                                            {...props}
                                            className={`${props.className} w-full h-full relative`}
                                            onClick={(e) => {
                                                setDate(dayDate)
                                                if (props.onClick) {
                                                    props.onClick(e)
                                                }
                                            }}
                                        >
                                        {props.children}
                                        {hasEventsForDay && (
                                            <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 flex gap-0.5">
                                                {getEventsForDate(dayDate)
                                                    .slice(0, 3)
                                                    .map((event, index) => (
                                                        <div
                                                            key={event.id}
                                                            className={`w-1.5 h-1.5 rounded-full ${getEventTypeColor(event.type)}`}
                                                        />
                                                    ))}
                                                {getEventsForDate(dayDate).length > 3 && (
                                                    <div className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                                                )}
                                            </div>
                                        )}
                                        </div>
                                    </div>
                                </td>
                            );
                        }
                    }}
                />
            </div>

            <Card className="flex-1 min-w-0">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        Events for{" "}
                        {date
                            ? date.toLocaleDateString("en-US", {
                                weekday: "long",
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                            })
                            : "Select a date"}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {selectedDateEvents.length > 0 ? (
                        <div className="space-y-3">
                            {selectedDateEvents.map((event) => (
                                <div
                                    key={event.id}
                                    className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                                >
                                    <div className={`w-3 h-3 rounded-full mt-1 ${getEventTypeColor(event.type)}`} />
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="font-medium text-sm">{event.title}</h3>
                                            <Badge variant="secondary" className={`text-xs ${getEventTypeBadgeColor(event.type)}`}>
                                                {event.type}
                                            </Badge>
                                        </div>
                                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                            <div className="flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                {event.time}
                                            </div>
                                            {event.location && (
                                                <div className="flex items-center gap-1">
                                                    <MapPin className="w-3 h-3" />
                                                    {event.location}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-muted-foreground">
                            <p>No events scheduled for this day</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
