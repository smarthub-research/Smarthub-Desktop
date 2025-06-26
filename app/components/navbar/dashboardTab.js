import DashboardSVG from "../svg/dashboardSVG";

export default function DashboardTab({getItemClasses}) {
    return (
        <div className={`${getItemClasses('home')}`}>
            <DashboardSVG/>
            <span className="whitespace-nowrap overflow-hidden max-w-0 group-hover:ml-3 group-hover:max-w-[200px] transition-all duration-300">
                        Dashboard
            </span>
        </div>
    )
}