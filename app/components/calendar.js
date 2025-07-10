import CalendarSVG from "./svg/calendarSVG";

export default function Calendar() {
    return (
        <div className="group h-full block transform transition-transform duration-300 hover:-translate-y-1.5 cursor-pointer">
            <div className="relative overflow-hidden flex flex-row justify-between items-center bg-white text-orange-700 group-hover:text-orange-600 p-6 py-8 rounded-xl shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                <div className="absolute top-0 left-0 right-0 h-2 bg-orange-500 transition-all duration-300 ease-out group-hover:bg-orange-400 group-hover:h-3"></div>
                <h2 className="mt-3 text-2xl font-semibold mb-2  transition-colors duration-300">
                    CALENDAR
                </h2>
                <CalendarSVG/>
                {/*<p className="text-gray-600 group-hover:text-gray-500 text-sm transition-colors duration-300">*/}
                {/*    Record data in realtime using your Smarthub Devices. All you have to do is simply pair, record and save.*/}
                {/*    Perfect for collecting high-quality sensor data for further analysis.*/}
                {/*</p>*/}
            </div>
        </div>
    )
}