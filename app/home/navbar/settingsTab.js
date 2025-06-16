import SettingsSVG from "../../svg/settingsSVG";

export default function SettingsTab({setCurrentPage, getItemClasses}) {
    return (
        <div onClick={() => setCurrentPage('settings')} className={getItemClasses('settings')}>
            <SettingsSVG/>
            <span className="whitespace-nowrap overflow-hidden max-w-0 group-hover:ml-3 group-hover:max-w-[200px] transition-all duration-300">
                        Settings
            </span>
        </div>
    )
}