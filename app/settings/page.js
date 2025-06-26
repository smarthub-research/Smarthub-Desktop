'use client'
import { useState } from 'react';
import ConnectedDevices from "../recorder/connector/connectedDevices";
import useFetchDevices from "../recorder/hooks/useFetchDevices";
import NearbyDevices from "../recorder/connector/nearbyDevices";

export default function Settings() {
    const { devices, deviceOne, deviceTwo, setDeviceOne, setDeviceTwo } = useFetchDevices();
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);
    const [darkMode, setDarkMode] = useState(false);
    const [username, setUsername] = useState('User');
    const [email, setEmail] = useState('user@example.com');

    return (
        <div className="container mx-auto p-6 max-w-3xl">
            <h1 className="text-2xl font-bold mb-6 text-center">Settings</h1>

            {/* Profile Section */}
            <section className="bg-surface-50 rounded-lg shadow-md p-6 mb-6">
                <h2 className="text-xl font-semibold mb-4">Profile</h2>
                <div className="space-y-4">
                    <div>
                        <label className="block text-gray-700 mb-2">Username</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full p-2 border rounded-md"
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 mb-2">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full p-2 border rounded-md"
                        />
                    </div>
                </div>
            </section>

            {/* Devices Section */}
            <section className="flex flex-col gap-4 bg-surface-50 rounded-lg shadow-md pt-4 px-6 mb-6">
                <ConnectedDevices
                    deviceOne={deviceOne}
                    deviceTwo={deviceTwo}
                    setDeviceOne={setDeviceOne}
                    setDeviceTwo={setDeviceTwo}
                />
                <NearbyDevices
                    devices={devices}
                    deviceOne={deviceOne}
                    deviceTwo={deviceTwo}
                    setDeviceOne={setDeviceOne}
                    setDeviceTwo={setDeviceTwo}
                />
            </section>

            {/* Preferences Section */}
            <section className="bg-surface-50 rounded-lg shadow-md p-6 mb-6">
                <h2 className="text-xl font-semibold mb-4">Preferences</h2>
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <span className="text-gray-700">Notifications</span>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={notificationsEnabled}
                                onChange={() => setNotificationsEnabled(!notificationsEnabled)}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-gray-700">Dark Mode</span>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={darkMode}
                                onChange={() => setDarkMode(!darkMode)}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                    </div>
                </div>
            </section>

            {/* Actions */}
            <div className="flex justify-end">
                <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                    Save Changes
                </button>
            </div>
        </div>
    );
}