import CalendarSVG from "../svg/calendarSVG";

export default function CalendarTab({getItemClasses}) {
    return (
        <div className={getItemClasses('calendar')}>
            <CalendarSVG/>
            <span className="whitespace-nowrap overflow-hidden max-w-0 group-hover:ml-3 group-hover:max-w-[200px] transition-all duration-300">
                        Calendar
            </span>
        </div>
    )
}