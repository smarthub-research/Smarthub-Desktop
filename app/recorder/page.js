'use client';
import React, { useEffect, useState } from "react";
import Link from "next/link";
import FlagConsole from "./navbar/flagConsole";
import { useFlagging } from "./context/flaggingContext";
import NavbarRecording from "./navbar/navbarRecording";
import ChartSection from "./chartSection";
import ViewSwapper from "./viewSwapper";

// Main RecorderTab component
export default function Recorder() {
    const [boxView, setBoxView] = useState(false);
    const { flagging, handleFlagging, width } = useFlagging();

    // Handle end of recording
    function handleEndRecording() {
        if (window.electronAPI) {
            window.electronAPI.setTestData(null);
            handleFlagging(false);
        }
    }

    return (
        <div className={'grow'}>
            <NavbarRecording/>
            <div className="flex flex-col pt-12 pb-8 px-4 overflow-x-hidden grow">
                   {/*style={{ width: flagging ? `${100 - width}vw` : '100vw' }}>*/}
                <div className={"flex flex-col grow w-full px-12 self-center gap-4 justify-center"}>
                    {/* Small control header under navbar */}
                    <div className="flex justify-between items-center">
                        {/* Grid vs box view for graphs */}
                        <ViewSwapper boxView={boxView} setBoxView={setBoxView} />
                        {/* End recording button */}
                        <Link href={"./reviewer"}
                              onClick={handleEndRecording}
                              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                        >
                            Finish Test
                        </Link>
                    </div>
                    <ChartSection boxView={boxView}/>
                </div>
            </div>

            {/* flagging console if we are flagging */}
            {flagging && (
                <FlagConsole setFlagging={handleFlagging}/>
            )}
        </div>
    );
}