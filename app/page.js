import Navbar from "./navbar";
import FullTrial from "./testRecordingComponents/fullTrial";
import Home from "./home";

const Page = () => {

    return (
        <div className={'flex flex-row h-[100vh] w-[100vw] overflow-x-hidden'}>
            <Navbar/>
            <FullTrial/>
        </div>
    );
};

export default Page;
