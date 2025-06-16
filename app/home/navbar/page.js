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

export default function Navbar({currentPage, setCurrentPage }) {

    // Function to get the classes for each navigation item based on the current page and minimized state
    const getItemClasses = (pageName) => {
        let baseClasses = "flex items-center justify-start opacity-60 py-2 px-1.5 rounded cursor-pointer hover:inner-shadow hover:shadow-sm";
        if (currentPage === pageName) {
            return `${baseClasses} bg-surface-100 border-surface-300 opacity-100 border font-medium text-primary-600`;
        }
        return baseClasses;
    };

    return (
        <div className={`group flex flex-col w-fit max-w-20 hover:max-w-56 h-screen text-black bg-surface-200
            border-surface-200 p-4 gap-4 transition-all duration-300 ease-in-out shrink-0`}>
            {/* Title */}
            <Title/>
            {/* Navigation items */}
            <div className="flex flex-col gap-2">
                <DashboardTab setCurrentPage={setCurrentPage} getItemClasses={getItemClasses}/>
                <RecorderTab setCurrentPage={setCurrentPage} getItemClasses={getItemClasses}/>
                <ReviewerTab setCurrentPage={setCurrentPage} getItemClasses={getItemClasses}/>
                <CalendarTab setCurrentPage={setCurrentPage} getItemClasses={getItemClasses}/>
                <BugReporterTab setCurrentPage={setCurrentPage} getItemClasses={getItemClasses}/>
            </div>

            {/* Bottom section */}
            <div className="flex flex-col gap-2 text-sm mt-auto">
                <SettingsTab setCurrentPage={setCurrentPage} getItemClasses={getItemClasses}/>
                <ProfileTab setCurrentPage={setCurrentPage} getItemClasses={getItemClasses}/>
            </div>
        </div>
    );
}