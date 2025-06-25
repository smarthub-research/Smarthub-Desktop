import Recorder from "./recorder";
import Reviewer from "./reviewer";
import Calendar from "./calendar";
import BugReporter from "./bugReporter";

export default function Services({setCurrentPage}) {
    return (
        <div className={'p-4 bg-surface-50 rounded-xl shadow-sm'}>
            <h2 className="mb-4 font-semibold">Services</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <span onClick={(() => setCurrentPage('recorder'))}>
                            <Recorder />
                        </span>
                <span onClick={(() => setCurrentPage('reviewer'))}>
                            <Reviewer />
                        </span>
                <span onClick={(() => setCurrentPage('calendar'))}>
                            <Calendar />
                        </span>
                <span onClick={(() => setCurrentPage('bugReport'))}>
                            <BugReporter />
                        </span>
            </div>
        </div>
    )
}