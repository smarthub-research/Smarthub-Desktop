'use client'
import Navbar from "./navbar";
import FullTrial from "./RecordingComponents/fullTrial";
import Home from "./home";
import DevPage from "./devPage";
import {useState} from "react";

const Page = () => {
    const [devView, setDevView] = useState(false);

    function handleDevView() {
        setDevView((state) => !state);
    }

    return (
        <div className={'flex flex-col h-[100vh] w-[100vw] overflow-x-hidden'}>
            {/*<Navbar/>*/}
            <button onClick={handleDevView} className={'cursor-pointer absolute bg-white text-black p-2 opacity-0 hover:opacity-100 transition ease-[500ms]'}>Dev View</button>

            {devView ? (
                <DevPage/>
            ) : (
                <>
                    <div className="flex flex-col items-end p-4">
                        <p className="font-bold text-[3vw] tracking-[0.3rem] leading-tight">SMARTHUB</p>
                        <p className="text-[2vw] tracking-[0.5rem] leading-[1.2rem]">RECORDER</p>
                    </div>
                    <FullTrial/>
                </>

            )}

        </div>
    );
};


export default Page;
