/**
 * RecorderTab Component
 * Renders the recorder navigation tab with an icon and expandable text on hover.
 * Props:
 * - getItemClasses: Function to get CSS classes based on the current page
 */
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