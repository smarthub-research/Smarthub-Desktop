'use client'

import ConnectionStatus from "./connectionStatus";
import {redirect, usePathname} from "next/navigation";
import React, { useEffect, useState } from "react";
import ControlPanel from "./controlPanel";
import FlagConsole from "./flagConsole";

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

    useEffect(() => {
        if (window.electronAPI) {
            // Get initial recording state
            const initRecordingState = async () => {
                const state = await window.electronAPI.getRecordingState();
                setRecordingState(state);
            };

            initRecordingState();

            // Listen for restart events
            window.electronAPI.onRestartRecording((eventData) => {
                if (eventData && eventData.startTime) {
                    setRecordingState({
                        isRecording: true,
                        startTime: eventData.startTime
                    });
                }
            });

            // Listen for begin-reading events
            window.electronAPI.onBeginReading((eventData) => {
                if (eventData && eventData.startTime) {
                    setRecordingState({
                        isRecording: true,
                        startTime: eventData.startTime
                    });
                }
            });

            // Listen for stop-reading events
            window.electronAPI.onStopReading(() => {
                setRecordingState({
                    isRecording: false,
                    startTime: null
                });
            });
        }
    }, []);

    // Timer effect
    useEffect(() => {
        let interval;
        if (recordingState.isRecording && recordingState.startTime) {
            interval = setInterval(() => {
                setRecordingTime((Date.now() - recordingState.startTime) / 1000);
            }, 100);
        } else {
            setRecordingTime(0);
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [recordingState]);

    return (
        <>
            <div className={`sticky flex flex-row-reverse top-0 z-5 w-[100%] h-[10vh]
            ${show ? "opacity-100" : "opacity-0"} transition`}>

                <div className={`p-2 text-right ${flagging && ('opacity-0')} transition`} onClick={handleReturnHome}>
                    <p className="font-bold text-[3vw] tracking-[0.3rem] leading-tight cursor-pointer">SMARTHUB</p>
                    <p className="text-[2vw] tracking-[0.5rem] leading-[1.2rem] pb-4 cursor-pointer">RECORDER</p>
                </div>

                {recording && (
                    <div className="flex flex-row grow gap-10 p-4 items-center">
                        <ConnectionStatus/>
                        <ControlPanel setFlagging={handleFlagging}/>

                        <div className="bg-gray-800 rounded-lg px-3 py-2 ml-auto">
                            {recordingState.isRecording ? (
                                <div className="flex items-center">
                                    <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse mr-2"></span>
                                    <span className="text-sm font-medium">
                                        Recording: {recordingTime.toFixed(1)}s
                                    </span>
                                </div>
                            ) : (
                                <span className="text-sm font-medium text-gray-400">
                                    Not recording
                                </span>
                            )}
                        </div>
                    </div>
                )}
            </div>
            {flagging && (
                <FlagConsole/>
            )}
        </>
    );
}