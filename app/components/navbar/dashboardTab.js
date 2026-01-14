/**
 * DashboardTab Component
 * Renders the dashboard/home navigation tab with an icon and expandable text on hover.
 * Props:
 * - getItemClasses: Function to get CSS classes based on the current page
 */
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