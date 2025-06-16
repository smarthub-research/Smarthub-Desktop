import ProfileSVG from "../../svg/profileSVG";

export default function ProfileTab({setCurrentPage, getItemClasses}) {
    return (
        <div onClick={() => setCurrentPage('profile')} className={getItemClasses('profile')}>
            <ProfileSVG/>
            <div className="whitespace-nowrap overflow-hidden max-w-0 group-hover:ml-3 group-hover:max-w-[200px] transition-all duration-300">
                <p>Username</p>
                {/*<p className="opacity-50">Role</p>*/}
            </div>
        </div>
    )
}