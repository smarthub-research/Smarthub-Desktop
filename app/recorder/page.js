'use client';

import { useState } from "react";
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
            window.electronAPI.setTestData(true);
            handleFlagging(false);
        }
    }

    return (
        <div className={'flex flex-row grow'}>
            <div className={`h-full grow`}>
                <NavbarRecording/>
                <div className="flex flex-col pb-8 px-4 w-full">
                    <div className={"flex flex-col w-full px-12 self-center gap-4 justify-center"}>
                        {/* Small control header under navbar */}
                        <div className="flex justify-between items-center">
                            {/* Grid vs box view for graphs */}
                            <ViewSwapper boxView={boxView} setBoxView={setBoxView} />
                            {/* End recording button */}
                            <Link href={"/recorder/reviewer"}
                                  onClick={handleEndRecording}
                                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                            >
                                Finish Test
                            </Link>
                        </div>
                        <ChartSection boxView={boxView}/>
                    </div>
                </div>
            </div>

            {/* flagging console if we are flagging */}
            {flagging && (
                <FlagConsole setFlagging={handleFlagging}/>
            )}
        </div>
    );
}