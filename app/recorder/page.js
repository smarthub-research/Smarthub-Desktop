'use client';

import { useState } from "react";
import Link from "next/link";
import NavbarRecording from "./navbar/navbarRecording";
import ChartSection from "./chartSection";
import ViewSwapper from "./viewSwapper";

// Main page component for the recorder section. Manages the recording UI,
// including chart display, view toggling, and test completion.
export default function Recorder() {
    // State for toggling between grid and column chart layout
    const [boxView, setBoxView] = useState(true);

    // Handler to end the current test and navigate to reviewer
    async function handleEndTest() {
        if (window.electronAPI) {
            await window.electronAPI.endTest();
            // Add a small delay to ensure the event is sent
            await new Promise(resolve => setTimeout(resolve, 100));
        }
    }

    return (
        <div className={'flex flex-row grow'}>
            <div className={` h-full grow transition-all duration-300 ease-in-out`}>
                <NavbarRecording/>
                <div className="flex flex-col pb-8 w-full">
                    <div className={"flex flex-col w-full px-12 self-center gap-4 justify-center"}>
                        {/* Small control header under navbar */}
                        <div className="flex justify-between items-center">
                            {/* Grid vs box view for graphs */}
                            <ViewSwapper boxView={boxView} setBoxView={setBoxView} />
                            {/* End recording button */}
                            <Link href={"/recorder/reviewer"}
                                onClick={handleEndTest}
                                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                            >
                                Finish Test
                            </Link>
                        </div>
                        <ChartSection boxView={boxView}/>
                    </div>
                </div>
            </div>
        </div>
    );
}
