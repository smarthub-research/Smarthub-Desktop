'use client';

// Left navbar component for the home page

import DashboardTab from "./dashboardTab";
import RecorderTab from "./recorderTab";
import ReviewerTab from "./reviewerTab";
import SettingsTab from "./settingsTab";
import ProfileTab from "./profileTab";
import Title from "./title";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import CalibrationTab from "./calibrationTab";
import { useState } from "react";

export default function Navbar() {
    // Get the base path and not the ending
    const fullPathname = usePathname();
    const pathname = fullPathname.split("/")[1];
    const router = useRouter();

    // Use state for hover
    const [hovered, setHovered] = useState(false);

    // Function to get the classes for each navigation item based on the current page and minimized state
    const getItemClasses = (pageName) => {
        let baseClasses = "flex items-center justify-start opacity-60 py-2 px-1.5 rounded cursor-pointer hover:inner-shadow hover:shadow-sm";
        if (pathname.includes(pageName) || (fullPathname === "/" && pageName === 'home')) {
            return `${baseClasses} bg-surface-100 border-surface-300 opacity-100 border font-medium text-primary-600`;
        }
        return baseClasses;
    };

    return (
        <div className="absolute top-0 left-0 w-screen h-screen pointer-events-none z-0">
            {/* Animated gradient background */}
            <div
                className={`absolute top-0 left-0 h-screen bg-gradient-to-r from-surface-200 to-transparent transition-all duration-300 ease-in-out pointer-events-none z-0
                    ${hovered ? 'w-[50vw] opacity-100' : 'w-0 opacity-0'}`}
            />
            {/* Navbar content */}
            <div
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
                className={`group absolute top-0 left-0 flex flex-col w-fit max-w-20 hover:max-w-56 h-screen text-black border-surface-200 p-4 gap-4 transition-all duration-300 ease-in-out shrink-0 z-20`}
                style={{ pointerEvents: 'auto' }}
            >
                {/* Title */}
                <Title />
                {/* Navigation items */}
                <div className="flex  flex-col gap-2">
                    <Link href={'/'}
                        onMouseEnter={() => router.prefetch('/')}
                    >
                        <DashboardTab getItemClasses={getItemClasses} />
                    </Link>
                    <Link href={'/recorder'}><RecorderTab getItemClasses={getItemClasses} /></Link>
                    <Link href={'/reviewer'}
                        onMouseEnter={() => router.prefetch('/reviewer')}
                    >
                        <ReviewerTab getItemClasses={getItemClasses} />
                    </Link>
                    <Link href={"/calibration"}>
                        <CalibrationTab getItemClasses={getItemClasses} />
                    </Link>
                    {/*<Link href={'/calendar'}><CalendarTab getItemClasses={getItemClasses}/></Link>*/}
                    {/*<Link href={'/messages'}><MessagesTab getItemClasses={getItemClasses}/></Link>*/}
                    {/*<Link href={'/bugReporter'}><BugReporterTab getItemClasses={getItemClasses}/></Link>*/}
                </div>

                {/* Bottom section */}
                <div className="flex relative flex-col gap-2 text-sm mt-auto">
                    <Link href={'/settings'}><SettingsTab getItemClasses={getItemClasses} /></Link>
                    <ProfileTab getItemClasses={getItemClasses} />
                </div>
            </div>
        </div>
    );
}