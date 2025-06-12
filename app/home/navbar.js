'use client';

// Left navbar component for the home page
export default function Navbar({currentPage, setCurrentPage }) {

    // Function to get the classes for each navigation item based on the current page and minimized state
    const getItemClasses = (pageName) => {
        let baseClasses = "flex items-center justify-start opacity-60 p-2 rounded hover:border-gray-200 hover:border cursor-pointer hover:shadow-lg";
        if (currentPage === pageName) {
            return `${baseClasses} bg-gray-100 border-gray-300 opacity-100 border shadow-inner`;
        }
        return baseClasses;
    };

    return (
        <div className={`group flex flex-col max-w-fit hover:w-56 h-screen text-black bg-white border-r 
            border-gray-200 p-4 gap-4 transition-all duration-300 ease-in-out shrink-0`}>
            <div className={`w-fit flex items-center mb-4 justify-center gap-2 transition-all`}>
                <img src={'/smarthub_logo.png'} className={'size-10 shrink-0'} alt={'logo'}/>
                <span className="font-bold text-xl hidden group-hover:block whitespace-nowrap overflow-hidden">Smarthub</span>
            </div>

            {/* Navigation items */}
            <div className="flex flex-col gap-2">
                {/* 1 Item */}
                <div onClick={() => setCurrentPage('dashboard')}
                     className={`${getItemClasses('dashboard')}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"
                         className="size-6 shrink-0">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h7.5"/>
                    </svg>
                    <span className="ml-3 whitespace-nowrap overflow-hidden hidden group-hover:block opacity-0 w-0 group-hover:w-auto group-hover:opacity-100 transition-all duration-300">
                        Dashboard
                    </span>
                </div>

                <div onClick={() => setCurrentPage('calendar')}
                     className={getItemClasses('calendar')}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6 shrink-0">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5m-9-3.75h.008v.008H12v-.008ZM12 15h.008v.008H12v-.008ZM12 12h.008v.008H12v-.008ZM9.75 15h.008v.008H9.75v-.008ZM9.75 12h.008v.008H9.75v-.008ZM7.5 15h.008v.008H7.5v-.008ZM7.5 12h.008v.008H7.5v-.008ZM14.25 15h.008v.008H14.25v-.008ZM14.25 12h.008v.008H14.25v-.008ZM16.5 15h.008v.008H16.5v-.008ZM16.5 12h.008v.008H16.5v-.008Z"/>
                    </svg>
                    <span className="ml-3 whitespace-nowrap overflow-hidden hidden group-hover:block opacity-0 w-0 group-hover:w-auto group-hover:opacity-100 transition-all duration-300">
                        Calendar
                    </span>
                </div>

                <div onClick={() => setCurrentPage('bugReport')} className={getItemClasses('bugReport')}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6 shrink-0">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 12.75c1.148 0 2.278.08 3.383.237 1.037.146 1.866.966 1.866 2.013 0 3.728-2.35 6.75-5.25 6.75S6.75 18.728 6.75 15c0-1.046.83-1.867 1.866-2.013A24.204 24.204 0 0 1 12 12.75Zm0 0c2.883 0 5.647.508 8.207 1.44a23.91 23.91 0 0 1-1.152 6.06M12 12.75c-2.883 0-5.647.508-8.208 1.44.125 2.104.52 4.136 1.153 6.06M12 12.75a2.25 2.25 0 0 0 2.248-2.354M12 12.75a2.25 2.25 0 0 1-2.248-2.354M12 8.25c.995 0 1.971-.08 2.922-.236.403-.066.74-.358.795-.762a3.778 3.778 0 0 0-.399-2.25M12 8.25c-.995 0-1.97-.08-2.922-.236-.402-.066-.74-.358-.795-.762a3.734 3.734 0 0 1 .4-2.253M12 8.25a2.25 2.25 0 0 0-2.248 2.146M12 8.25a2.25 2.25 0 0 1 2.248 2.146M8.683 5a6.032 6.032 0 0 1-1.155-1.002c.07-.63.27-1.222.574-1.747m.581 2.749A3.75 3.75 0 0 1 15.318 5m0 0c.427-.283.815-.62 1.155-.999a4.471 4.471 0 0 0-.575-1.752M4.921 6a24.048 24.048 0 0 0-.392 3.314c1.668.546 3.416.914 5.223 1.082M19.08 6c.205 1.08.337 2.187.392 3.314a23.882 23.882 0 0 1-5.223 1.082"/>
                    </svg>
                    <span className="ml-3 whitespace-nowrap overflow-hidden hidden group-hover:block opacity-0 w-0 group-hover:w-auto group-hover:opacity-100 transition-all duration-300">
                        Bug Reporter
                    </span>
                </div>

                <div onClick={() => setCurrentPage('recorder')} className={getItemClasses('recorder')}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6 shrink-0">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z" />
                    </svg>
                    <span className="ml-3 whitespace-nowrap overflow-hidden hidden group-hover:block opacity-0 w-0 group-hover:w-auto group-hover:opacity-100 transition-all duration-300">
                        Recorder
                    </span>
                </div>

                <div onClick={() => setCurrentPage('reviewer')} className={getItemClasses('reviewer')}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6 shrink-0">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 15.75-2.489-2.489m0 0a3.375 3.375 0 1 0-4.773-4.773 3.375 3.375 0 0 0 4.774 4.774ZM21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                    </svg>
                    <span className="ml-3 whitespace-nowrap overflow-hidden hidden group-hover:block opacity-0 w-0 group-hover:w-auto group-hover:opacity-100 transition-all duration-300">
                        Reviewer
                    </span>
                </div>
            </div>

            {/* Bottom section */}
            <div className="flex flex-col gap-2 text-sm mt-auto">
                {/* Settings */}
                <div onClick={() => setCurrentPage('settings')} className={getItemClasses('settings')}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5"
                         stroke="currentColor" className="size-6 shrink-0">
                        <path strokeLinecap="round" strokeLinejoin="round"
                              d="M11.42 15.17 17.25 21A2.652 2.652 0 0 0 21 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 1 1-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 0 0 4.486-6.336l-3.276 3.277a3.004 3.004 0 0 1-2.25-2.25l3.276-3.276a4.5 4.5 0 0 0-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437 1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008Z"/>
                    </svg>
                    <span className="ml-3 whitespace-nowrap overflow-hidden hidden group-hover:block opacity-0 w-0 group-hover:w-auto group-hover:opacity-100 transition-all duration-300">
                        Settings
                    </span>
                </div>

                {/* Profile section */}
                <div onClick={() => setCurrentPage('profile')} className={getItemClasses('profile')}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5"
                         stroke="currentColor" className="size-6 opacity-50 shrink-0">
                        <path strokeLinecap="round" strokeLinejoin="round"
                              d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/>
                    </svg>
                    <div className="ml-3 whitespace-nowrap overflow-hidden hidden group-hover:block opacity-0 w-0 group-hover:w-auto group-hover:opacity-100 transition-all duration-300">
                        <p>Username</p>
                        {/*<p className="opacity-50">Role</p>*/}
                    </div>
                </div>
            </div>
        </div>
    );
}