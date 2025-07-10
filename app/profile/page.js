'use client'
import {useAuth} from "../auth/authContext";

export default function Profile() {
    const { user } = useAuth();

    return (
        <div className={'flex flex-col justify-center items-center mt-12 h-full'}>
            <p>{user.user_metadata.full_name}</p>
            <p>{user.user_metadata.email}</p>
            <p>{user.user_metadata.role}</p>
        </div>
    )
}