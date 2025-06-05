import UsageGraph from "./usageGraph";

export default function Analytics() {
    return (
        <div className="flex col-span-full justify-between items-center rounded-lg h-full p-10 bg-slate-200 text-black">
            <div>
                <UsageGraph/>
            </div>
            <div>
                Graph 2
            </div>
            <div>
                <p>Number of Records</p>
                <p>other</p>
            </div>
        </div>
    );
}