'use client'
import Connector from "./connector/page";
import DevPage from "./dev/page";
import {useState} from "react";

const Page = () => {
    const [devView, setDevView] = useState(false);

    function handleDevView() {
        if (devView === true) {

        }
        setDevView((state) => !state);
    }

    return (
        <div className={'flex flex-col h-[90vh] w-[100vw] overflow-x-hidden'}>
            {/*<Navbar/>*/}
            <button onClick={handleDevView} className={'cursor-pointer absolute bg-white top-0 ' +
                'z-101 text-black p-2 opacity-0 hover:opacity-100 transition ease-[500ms]'}>
                Dev View
            </button>

            {devView ? (
                <DevPage/>
            ) : (
                <Connector/>
            )}

        </div>
    );
};


export default Page;
