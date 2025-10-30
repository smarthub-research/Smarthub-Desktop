'use client';

import { useState } from "react";
import Link from "next/link";
import NavbarRecording from "./navbar/navbarRecording";
import ChartSection from "./chartSection";
import ViewSwapper from "./viewSwapper";

// Main RecorderTab component
export default function Recorder() {
    const [boxView, setBoxView] = useState(true);

    async function handleEndTest() {
        await window.electronAPI.endTest()
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