'use client'
import ProfileSVG from "../svg/profileSVG";
import {useAuth} from "../../auth/authContext";

export default function ProfileTab({getItemClasses}) {
    const { user } = useAuth();

    return (
        <div className={`${getItemClasses('profile')}`}>
            <ProfileSVG/>
            <div className="whitespace-nowrap overflow-hidden leading-4 max-w-0 group-hover:ml-3 group-hover:max-w-[200px] transition-all duration-300">
                {user && (
                    <>
                        <p className={'font-semibold'}>{user.user_metadata.full_name}</p>
                        <p className={'opacity-50'}>{user.user_metadata.role}</p>
                    </>
                )}
            </div>
        </div>
    )
}