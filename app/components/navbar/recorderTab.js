import RecorderSVG from "../svg/recorderSVG";

export default function RecorderTab({getItemClasses}) {
    return (
        <div className={getItemClasses('recorder')}>
            <RecorderSVG/>
            <span className="whitespace-nowrap overflow-hidden max-w-0 group-hover:ml-3 group-hover:max-w-[200px] transition-all duration-300">
                        Recorder
            </span>
        </div>
    )
}