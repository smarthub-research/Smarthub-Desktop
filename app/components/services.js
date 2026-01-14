/**
 * Services Component
 * Displays a grid of service cards linking to the main application features: Recorder, Reviewer, and Calibration.
 * Each card is wrapped in a Link component for navigation.
 */
import Recorder from "./recorder";
import Reviewer from "./reviewer";
import Link from "next/link";
import Calibration from "./calibration";

export default function Services() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link href={'/recorder'}><Recorder/></Link>
            <Link href={'/reviewer'}><Reviewer/></Link>
            <Link href={'/calibration'}><Calibration/></Link>
            {/*<Link href={'/calendar'}><Calendar/></Link>*/}
            {/*<Link href={'/bugReporter'}><BugReporter/></Link>*/}
        </div>
    )
}