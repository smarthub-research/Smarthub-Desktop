
import Device from "./device";
import {useState} from "react";
import {hidden} from "next/dist/lib/picocolors";

export default function NearbyDevices({devices, deviceOne, deviceTwo, setDeviceOne, setDeviceTwo}) {
    const [isCollapsed, setCollapsed] = useState(false)

    // Function to handle connecting a device
    function handleConnect(device) {
        if (!deviceOne) {
            setDeviceOne(device);
        } else if (!deviceTwo) {
            setDeviceTwo(device);
        } else {
            console.warn("Cannot connect more than two devices.");
        }
    }

    return (
        <div className={`w-full flex-grow ${!isCollapsed && 'pb-6'}`}>
            <div className={'flex justify-between pr-1 items-center'}>
                <p className="text-lg md:text-xl font-bold mb-3">Nearby</p>
                <span onClick={() => {setCollapsed(!isCollapsed)}} className={'mb-1'}>
                    {isCollapsed ?
                        (
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5"
                                 stroke="currentColor" className="size-6 cursor-pointer">
                                <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5"/>
                            </svg>
                        ):(
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6 cursor-pointer">
                                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 15.75 7.5-7.5 7.5 7.5" />
                            </svg>
                        )
                    }
                </span>
            </div>
            <div className={`bg-white rounded-lg divide-y divide-black 
            ${isCollapsed ? ('h-0 p-0 m-0 overflow-hidden opacity-0') : ('h-[35vh] md:h-[40vh] py-2 px-4 overflow-y-auto opacity-100')} 
            drop-shadow-sm transition-all duration-300`}>
                {devices.length === 0 ? (
                    <p className="text-gray-400 text-center py-4">Searching for devices...</p>
                ) : (
                    // Only display devices that are not already connected
                    devices
                        .filter(device =>
                            (!deviceOne || device.name !== deviceOne.name) &&
                            (!deviceTwo || device.name !== deviceTwo.name)
                        )
                        .map((device) => {
                            const canConnect = !deviceOne || !deviceTwo;
                            return (
                                <div key={device.name} className="mb-3 last:mb-0">
                                    <Device
                                        device={device}
                                        status={canConnect ? "notConnected" : "cannotConnect"}
                                        onConnect={canConnect ? handleConnect : null}
                                    />
                                </div>
                            );
                        })
                )}
            </div>
        </div>
    )
}