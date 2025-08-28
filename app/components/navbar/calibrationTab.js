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