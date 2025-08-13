import ProfileSVG from "../svg/profileSVG";
import LogoutSVG from "../svg/logoutSVG"; // Make sure this exists
import {useAuth} from "../../auth/authContext";
import {useState} from "react";

export default function ProfileTab({getItemClasses}) {
    const { user, userRole, handleLogout } = useAuth();
    const [isHovered, setIsHovered] = useState(false);

    return (
        <div
            className={`${getItemClasses('profile')} relative`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {isHovered ? (
                <span onClick={e => { e.stopPropagation(); handleLogout(); }}
                      className={" text-red-700 border border-red-600 p-1 rounded-full"}
                >
                <LogoutSVG />
            </span>
            ) : (
                <ProfileSVG />
            )}
            <div className="whitespace-nowrap overflow-hidden leading-4 max-w-0 group-hover:ml-3 group-hover:max-w-[200px] transition-all duration-300">
                {user && (
                    <>
                        <p className={'font-semibold'}>{user.user_metadata.full_name}</p>
                        <p className={'opacity-50'}>{userRole}</p>
                    </>
                )}
            </div>
        </div>
    );
}