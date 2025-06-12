import Recorder from "./recorder";
import Reviewer from "./reviewer";
import RecentTests from "./recentTests";
import Analytics from "./analytics";

// Component to render the home dashboard page
export default function Dashboard({setCurrentPage}) {
    return (
        <div className="flex flex-col text-black h-full p-6 lg:p-10 gap-6 bg-slate-100">
            <h1 className="font-bold text-2xl">Home</h1>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
                {/* Grid for the main services we offer */}
                <div className="lg:col-span-2">
                    {/*<Analytics/>*/}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <span onClick={(() => setCurrentPage('recorder'))}>
                            <Recorder />
                        </span>
                        <span onClick={(() => setCurrentPage('reviewer'))}>
                            <Reviewer />
                        </span>
                    </div>
                </div>
                {/* Div for all other info we want to display */}
                <div className="lg:col-span-1">
                    <RecentTests />
                </div>
            </div>
        </div>
    );
}