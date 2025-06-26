import BugSVG from "../svg/bugSVG";

export default function BugReporterTab({getItemClasses}) {
    return (
        <div className={getItemClasses('bugReport')}>
            <BugSVG />
            <span className="whitespace-nowrap overflow-hidden max-w-0 group-hover:ml-3 group-hover:max-w-[200px] transition-all duration-300">
                        Bug Reporter
            </span>
        </div>
    )
}