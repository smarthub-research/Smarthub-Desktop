'use client';
import { useState } from "react";
import Navbar from "./navbar";
import Page from "./dashboard/page";

// This is the main entry point for the home page of the application.
export default function Home() {
    const [currentPage, setCurrentPage] = useState('dashboard');
    const [isNavbarMinimized, setIsNavbarMinimized] = useState(false);

    // Function to toggle the navbar's minimized state
    const toggleNavbar = () => {
        setIsNavbarMinimized(!isNavbarMinimized);
    };

    return (
        <div className={'flex flex-row h-screen max-h-screen w-screen max-w-screen overflow-hidden bg-gray-100'}>
            <Navbar
                isMinimized={isNavbarMinimized}
                toggleMinimize={toggleNavbar}
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
            />
            <div className="flex-grow overflow-auto">
                {currentPage === 'dashboard' && (<Page />)}
                {currentPage === 'calendar' && (<div>Calendar Page Placeholder</div>)}
                {currentPage === 'bugReport' && (<div>Bug Report Page Placeholder</div>)}
                {currentPage === 'settings' && (<div>Settings Page Placeholder</div>)}
            </div>
        </div>
    );
}