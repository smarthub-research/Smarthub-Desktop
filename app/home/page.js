'use client';
import { useState } from "react";
import Navbar from "./navbar/page";
import Calendar from "./calendar/page";
import Dashboard from "./dashboard/page";
import ReviewerHomePage from "../smarthubReviewer/page";
import BugReporter from "../bugReporter/page";
import Settings from "./settings/page";
import Recorder from "../smarthubRecorder/recorder/page";
import {FlaggingProvider} from "../smarthubRecorder/context/flaggingContext";

// This is the main entry point for the home page of the application.
export default function Home() {
    const [currentPage, setCurrentPage] = useState('dashboard');

    return (
        <div className={'flex flex-row h-screen max-h-screen w-screen max-w-screen overflow-hidden bg-surface-200'}>
            <Navbar currentPage={currentPage} setCurrentPage={setCurrentPage}/>

            <div className="flex-grow overflow-auto">
                {currentPage === 'dashboard' && (<Dashboard setCurrentPage={setCurrentPage}/>)}
                {currentPage === 'calendar' && (<Calendar/>)}
                {currentPage === 'bugReport' && (<BugReporter/>)}
                {currentPage === 'recorder' && (
                    <FlaggingProvider>
                        <Recorder/>
                    </FlaggingProvider>
                )}
                {currentPage === 'reviewer' && (<ReviewerHomePage/>)}
                {currentPage === 'settings' && (<Settings/>)}
                {currentPage === 'profile' && (<div>Profile placeholder</div>)}
            </div>
        </div>
    );
}