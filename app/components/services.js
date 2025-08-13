import Recorder from "./recorder";
import Reviewer from "./reviewer";
import Calendar from "./calendar";
import BugReporter from "./bugReporter";
import Link from "next/link";

export default function Services() {
    return (
        <>
            <h1 className={'font-bold text-xl'}>Quick Actions</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Link href={'/recorder'}><Recorder/></Link>
                <Link href={'/reviewer'}><Reviewer/></Link>
                <Link href={'/calendar'}><Calendar/></Link>
                <Link href={'/bugReporter'}><BugReporter/></Link>
            </div>
        </>
    )
}