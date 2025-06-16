import UsageGraph from "./usageGraph";
import Upcoming from "./upcoming";
import UserGraph from "./userGraph";

export default function Analytics({testFiles}) {
    return (
        <div className={'p-4 bg-gray-50 rounded-xl shadow-sm'}>
            <h2 className="mb-4 font-semibold text-gray-80">Analytics</h2>
            <div className="grid grid-cols-5 gap-4">
                {/* Usage graph card */}
                <div className="col-span-2 bg-white rounded-lg shadow-md p-3 h-52">
                    <h2 className="text-sm font-medium mb-1">Usage Statistics</h2>
                    <div className="h-40">
                        <UsageGraph testFiles={testFiles}/>
                    </div>
                </div>

                {/* User graph card */}
                <div className="col-span-2 bg-white rounded-lg shadow-md p-3 h-52">
                    <h2 className="text-sm font-medium mb-1">User Activity</h2>
                    <div className="h-40">
                        <UserGraph />
                    </div>
                </div>

                {/* Upcoming events card */}
                <div className="bg-white rounded-lg shadow-md">
                    <Upcoming />
                </div>
            </div>
        </div>

    );
}