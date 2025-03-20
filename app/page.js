import Navbar from "./navbar";
import FullTrial from "./RecordingComponents/fullTrial";
import Home from "./home";

const Page = () => {



    return (
        <div className={'flex flex-col h-[100vh] w-[100vw] overflow-x-hidden'}>
            {/*<Navbar/>*/}
            <div className="flex flex-col items-end p-4">
                <p className="font-bold text-[3vw] tracking-[0.3rem] leading-tight">SMARTHUB</p>
                <p className="text-[2vw] tracking-[0.5rem] leading-[1.2rem]">RECORDER</p>
            </div>
            <FullTrial/>
        </div>
    );
};

export const metadata = {
    title: "Smarthub Recorder",
    description: "N/A",
}

export default Page;
