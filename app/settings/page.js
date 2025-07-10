'use client'
import { useState } from 'react';
import ConnectedDevices from "../recorder/connector/connectedDevices";
import useFetchDevices from "../recorder/hooks/useFetchDevices";
import NearbyDevices from "../recorder/connector/nearbyDevices";
import {useAuth} from "../auth/authContext";
import {useRouter} from "next/navigation";

export default function Settings() {
    const router = useRouter();
    const { devices, deviceOne, deviceTwo, setDeviceOne, setDeviceTwo } = useFetchDevices();
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);
    const [darkMode, setDarkMode] = useState(false);
    const { user, signOut } = useAuth();
    const [email, setEmail] = useState("user.metadata.email");

    function handleLogout() {
        router.push('/auth/login')
        signOut();
    }

    return (
        <div className="container mx-auto py-8 px-4 max-w-4xl mt-4">
            <h1 className="text-3xl font-bold text-center text-gray-800 pb-4">Settings</h1>

            {/* Profile Section */}
            <section className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-100">
                <h2 className="text-xl font-semibold mb-5 text-gray-800 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Profile
                </h2>
                <div className="space-y-5">
                    <div>
                        <label className="block text-gray-700 font-medium mb-2">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                        />
                    </div>
                    <button
                        className="mt-4 px-5 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center"
                        onClick={handleLogout}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V4a1 1 0 00-1-1H3zm7 4.414L11.414 9H5a1 1 0 100 2h6.414l-1.414 1.414a1 1 0 001.414 1.414l4-4a1 1 0 000-1.414l-4-4a1 1 0 10-1.414 1.414z" clipRule="evenodd" />
                        </svg>
                        Logout
                    </button>
                </div>
            </section>

            {/* Devices Section */}
            <section className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-100">
                <h2 className="text-xl font-semibold mb-5 text-gray-800 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    Devices
                </h2>
                <div className="bg-gray-50 rounded-lg p-4">
                    <ConnectedDevices
                        deviceOne={deviceOne}
                        deviceTwo={deviceTwo}
                        setDeviceOne={setDeviceOne}
                        setDeviceTwo={setDeviceTwo}
                    />
                    <div className="mt-6">
                        <NearbyDevices
                            devices={devices}
                            deviceOne={deviceOne}
                            deviceTwo={deviceTwo}
                            setDeviceOne={setDeviceOne}
                            setDeviceTwo={setDeviceTwo}
                        />
                    </div>
                </div>
            </section>

            {/* Preferences Section */}
            <section className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-100">
                <h2 className="text-xl font-semibold mb-5 text-gray-800 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Preferences
                </h2>
                <div className="space-y-6 bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between p-3 border-b border-gray-200">
                        <div className="flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                            </svg>
                            <span className="text-gray-700 font-medium">Notifications</span>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={notificationsEnabled}
                                onChange={() => setNotificationsEnabled(!notificationsEnabled)}
                                className="sr-only peer"
                            />
                            <div className="w-12 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                        </label>
                    </div>
                    <div className="flex items-center justify-between p-3">
                        <div className="flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                            </svg>
                            <span className="text-gray-700 font-medium">Dark Mode</span>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={darkMode}
                                onChange={() => setDarkMode(!darkMode)}
                                className="sr-only peer"
                            />
                            <div className="w-12 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                        </label>
                    </div>
                </div>
            </section>

            {/* Actions */}
            <div className="flex justify-end">
                <button className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-md flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Save Changes
                </button>
            </div>
        </div>
    );
}