import RecentTests from "./components/recentTests";
import Services from "./components/services";

export default async function DashboardClient() {
    let testFiles = []
    try {
        const response = await fetch("http://localhost:8000/db/tests", {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        const data = await response.json();
        testFiles = data.data || []
    } catch (error) {
        console.log(error);
    }

    return (
        <div className="mt-12 ml-12 flex flex-col h-full w-full p-6 lg:p-10 gap-6 bg-surface-200">
            {/*<Analytics testFiles={testFiles} />*/}
            <div className=" grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
                <div className="flex flex-col gap-4 lg:col-span-2">
                    <Services/>
                </div>
                <div className="flex flex-col gap-6 lg:col-span-1">
                    <RecentTests testFiles={testFiles}/>
                    {/*<Announcements/>*/}
                </div>
            </div>
        </div>
    );
}