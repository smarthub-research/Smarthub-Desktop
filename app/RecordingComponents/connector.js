'use client'
import {useEffect, useState} from "react";
import Device from "./Device";
import useFetchDevices from "../hooks/useFetchDevices";

export default function Connector({setConnected}) {
    const [deviceOne, setDeviceOne] = useState(null);
    const [deviceTwo, setDeviceTwo] = useState(null);
    const { devices } = useFetchDevices();

    function handleConnect(device) {
        if (!deviceOne) {
            setDeviceOne(device);
        } else if (!deviceTwo) {
            setDeviceTwo(device);
        } else {
            console.warn("Cannot connect more than two devices.");
        }
    }

    useEffect(() => {
        if (deviceOne && deviceTwo) {
            setConnected(true);
        } else {
            setConnected(false);
        }
    }, [deviceOne, deviceTwo]);

    function handleDisconnect(device) {
        if (deviceOne && deviceOne[0] === device[0]) {
            setDeviceOne(null);
        } else if (deviceTwo && deviceTwo[0] === device[0]) {
            setDeviceTwo(null);
        }
    }

    function scrollToRecord() {
        window.scrollTo({ top: 100, behavior: "smooth" });
    }

    return (
        <div className={'flex flex-col max-h-[100vh] h-[100vh] items-center gap-[2vh]'}>
            <h1 className={'p-8 text-5xl font-bold tracking-wide'}>Perform Trial</h1>
            <div className={'flex flex-col gap-20 items-center h-[65vh]'}>
                <div>
                    <p className={'text-xl font-bold py-2'}>Connected Devices</p>
                    <div className={"bg-[#0a0a0a] p-4 rounded-lg w-[45vw]"}>
                        {deviceOne ? (
                            <Device
                                device={deviceOne}
                                status={'connected'}
                                onDisconnect={handleDisconnect}
                            />
                        ) : (
                            <h1 className={'font-bold'}>No Connected Device</h1>
                        )}
                        <hr className={'bg-white my-4'}/>
                        {deviceTwo ? (
                            <Device
                                device={deviceTwo}
                                status={'connected'}
                                onDisconnect={handleDisconnect}
                            />
                        ) : (
                            <h1 className={'font-bold'}>No Connected Device</h1>
                        )}
                    </div>
                </div>

                <div className={'grow'}>
                    <p className={'text-xl font-bold py-2'}>Nearby Devices</p>
                    <div className={"p-4 rounded-lg w-[45vw] bg-[#0a0a0a] max-h-[45vh] h-[45vh] overflow-y-scroll"}>
                        {devices
                            .filter(device => device !== deviceOne && device !== deviceTwo) // Only show unconnected devices
                            .map((device) => {
                                const canConnect = !deviceOne || !deviceTwo;
                                return (
                                    <div key={device[0]}>
                                        <Device
                                            device={device}
                                            status={canConnect ? "notConnected" : "cannotConnect"}
                                            onConnect={canConnect ? handleConnect : null}
                                        />
                                        <hr className="bg-white my-4" />
                                    </div>
                                );
                            })}
                    </div>
                </div>
            </div>

            <div
                onClick={() => !(deviceOne && deviceTwo) && scrollToRecord()}
                className={`bg-[#4a4a4a] px-4 py-2 rounded-lg mt-[10vh] ${(deviceOne && deviceTwo) ? ('opacity-100 cursor-pointer'):('opacity-50')}`}>
                Continue
            </div>
        </div>
    );
}
