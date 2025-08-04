'use client';

// Left navbar component for the home page
import DashboardTab from "./dashboardTab";
import RecorderTab from "./recorderTab";
import ReviewerTab from "./reviewerTab";
import CalendarTab from "./calendarTab";
import BugReporterTab from "./bugReporterTab";
import SettingsTab from "./settingsTab";
import ProfileTab from "./profileTab";
import Title from "./title";
import {usePathname} from "next/navigation";
import Link from "next/link";
import DraggableNav from "../draggableNav";
import MessagesTab from "./messagesTab";

export default function Navbar() {
    const pathname = usePathname()

    // Function to get the classes for each navigation item based on the current page and minimized state
    const getItemClasses = (pageName) => {
        let baseClasses = "flex items-center justify-start opacity-60 py-2 px-1.5 rounded cursor-pointer hover:inner-shadow hover:shadow-sm";
        if (pathname.includes(pageName) || (pathname === "/" && pageName === 'home')) {
            return `${baseClasses} bg-surface-100 border-surface-300 opacity-100 border font-medium text-primary-600`;
        }
        return baseClasses;
    };

    return (
        <div className={`group sticky top-0 left-0 flex flex-col w-fit max-w-20 hover:max-w-56 h-screen text-black bg-surface-200
            border-surface-200 p-4 gap-4 transition-all duration-300 ease-in-out shrink-0 z-20`}>
            <DraggableNav />
            {/* Title */}
            <Title/>
            {/* Navigation items */}
            <div className="flex flex-col gap-2">
                <Link href={'/'}><DashboardTab getItemClasses={getItemClasses}/></Link>
                <Link href={'/recorder'}><RecorderTab getItemClasses={getItemClasses}/></Link>
                <Link href={'/reviewer'}><ReviewerTab getItemClasses={getItemClasses}/></Link>
                <Link href={'/calendar'}><CalendarTab getItemClasses={getItemClasses}/></Link>
                <Link href={'/messages'}><MessagesTab getItemClasses={getItemClasses}/></Link>
                <Link href={'/bugReporter'}><BugReporterTab getItemClasses={getItemClasses}/></Link>
            </div>

            {/* Bottom section */}
            <div className="flex flex-col gap-2 text-sm mt-auto">
                <Link href={'/settings'}><SettingsTab getItemClasses={getItemClasses}/></Link>
                <ProfileTab getItemClasses={getItemClasses}/>
            </div>
        </div>
    );
}