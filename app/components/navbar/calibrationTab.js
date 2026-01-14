/**
 * CalibrationTab Component
 * Renders the calibration navigation tab with an icon and expandable text on hover.
 * Props:
 * - getItemClasses: Function to get CSS classes based on the current page
 */
import CalibrationSVG from "../svg/calibrationSVG";

export default function CalibrationTab({ getItemClasses }) {
    return (
        <div className={`${getItemClasses('calibration')}`}>
            <CalibrationSVG/>
            <span className="whitespace-nowrap overflow-hidden max-w-0 group-hover:ml-3 group-hover:max-w-[200px] transition-all duration-300">
                Calibration
            </span>
        </div>
    )
}