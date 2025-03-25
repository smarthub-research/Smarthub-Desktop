'use client'

import ConnectionStatus from "./connectionStatus";
import {redirect, usePathname} from "next/navigation";
import React, { useEffect, useState } from "react";
import ControlPanel from "./controlPanel";
import FlagConsole from "./flagConsole";
import Link from "next/link";

export default function NavbarRecording() {
    const pathname = usePathname();
    const [show, setShow] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);
    const [recording, setRecording] = useState(pathname === "/recorder/");
    const [flagging, setFlagging] = useState(false);
    const [recordingState, setRecordingState] = useState({
        isRecording: false,
        startTime: null
    });
    const [recordingTime, setRecordingTime] = useState(0);

    function handleFlagging() {
        setFlagging(!flagging);
    }

    useEffect(() => {
        setRecording(pathname === "/recorder");
    }, [pathname]);

    useEffect(() => {
        const handleScroll = () => {
            setShow(window.scrollY <= lastScrollY);
            setLastScrollY(window.scrollY);
        };

        window.addEventListener("scroll", handleScroll);
        return () => {
            window.removeEventListener("scroll", handleScroll);
        };
    }, [lastScrollY]);

    function handleReturnHome() {
        window.electronAPI.resetDevices();
        redirect('/');
    }

    function handleEndRecording() {
        if (window.electronAPI) {
            window.electronAPI.endTest();
        }
    }

    // Set up and clean up IPC listeners
    useEffect(() => {
        if (!window.electronAPI) return;

        // Define event handlers
        const handleRestartRecording = (eventData) => {
            console.log("Restart recording handler triggered", eventData);
            setRecordingTime(0); // Reset time only on restart

            if (eventData && eventData.startTime) {
                setRecordingState({
                    isRecording: true,
                    startTime: eventData.startTime
                });
            }
        };

        const handleBeginReading = (eventData) => {
            console.log("Begin reading handler triggered", eventData);
            if (eventData && eventData.startTime) {
                setRecordingState({
                    isRecording: true,
                    startTime: eventData.startTime
                });
            }
        };

        const handleStopReading = () => {
            console.log("Stop reading handler triggered");
            // Calculate the final time before stopping
            if (recordingState.isRecording && recordingState.startTime) {
                const finalTime = (Date.now() - recordingState.startTime) / 1000;
                setRecordingTime(finalTime);
            }

            setRecordingState({
                isRecording: false,
                startTime: null
            });
        };

        // Register event listeners and store the returned cleanup functions
        const restartListener = window.electronAPI.onRestartRecording(handleRestartRecording);
        const beginListener = window.electronAPI.onBeginReading(handleBeginReading);
        const stopListener = window.electronAPI.onStopReading(handleStopReading);

        // Get initial recording state
        const initRecordingState = async () => {
            if (window.electronAPI.getRecordingState) {
                const state = await window.electronAPI.getRecordingState();
                setRecordingState(state);
            }
        };

        initRecordingState();

        // Clean up function to remove listeners when component unmounts
        return () => {
            if (window.electronAPI) {
                // Use the returned cleanup functions from the listeners
                restartListener && restartListener();
                beginListener && beginListener();
                stopListener && stopListener();
            }
        };
    }, []);

    return (
        <>
            <div className={`sticky flex flex-row-reverse top-0 z-5 w-[100%] h-[10vh]
            ${show ? "opacity-100" : "opacity-0"} transition`}>

                <div className={`p-2 text-right ${flagging && ('opacity-0')} transition`} onClick={handleReturnHome}>
                    <p className="font-bold text-[3vw] tracking-[0.3rem] leading-tight cursor-pointer">SMARTHUB</p>
                    <p className="text-[2vw] tracking-[0.5rem] leading-[1.2rem] pb-4 cursor-pointer">RECORDER</p>
                </div>

                {recording && (
                    <div className="flex flex-row grow gap-6 justify-center p-4 items-center ">
                        <ConnectionStatus/>
                        <ControlPanel setFlagging={handleFlagging} flagging={flagging}/>

                        <div className="flex bg-[#0a0a0a] items-center justify-center h-full rounded-lg px-6 py-2 ">
                            {recordingState.isRecording ? (
                                <div className="flex items-center">
                                    <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse mr-2"></span>
                                    <span className="text-sm font-medium">
                                        Recording: {recordingTime.toFixed(1)}s
                                    </span>
                                </div>
                            ) : (
                                <div className="flex items-center text-gray-400">
                                    <span className="h-2 w-2 rounded-full bg-gray-500 mr-2"></span>
                                    <span className="text-sm font-medium">
                                        {recordingTime.toFixed(1) > 0 ? ("Not Recording " + recordingTime.toFixed(1) + "s") : ("Not recording")}
                                    </span>
                                </div>
                            )}
                        </div>

                        <Link href={"/reviewer/"} onClick={handleEndRecording} className="flex bg-[#0a0a0a] hover:bg-blue-600 text-white items-center justify-center h-full rounded-lg px-6 py-2 transition-colors">
                            <p className="text-sm font-medium">Finish Test</p>
                        </Link>

                    </div>
                )}

            </div>
            {flagging && (
                <FlagConsole setFlagging={handleFlagging}/>
            )}
        </>
    );
}