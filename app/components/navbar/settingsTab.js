/**
 * SettingsTab Component
 * Renders the settings navigation tab with an icon and expandable text on hover.
 * Props:
 * - getItemClasses: Function to get CSS classes based on the current page
 */
import SettingsSVG from "../svg/settingsSVG";

export default function SettingsTab({getItemClasses}) {
    return (
        <div className={getItemClasses('settings')}>
            <SettingsSVG/>
            <span className="whitespace-nowrap overflow-hidden max-w-0 group-hover:ml-3 group-hover:max-w-[200px] transition-all duration-300">
                        Settings
            </span>
        </div>
    )
}