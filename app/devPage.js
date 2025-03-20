'use client'
import {useEffect, useState} from "react";
import ConnectionForm from "./RecordingComponents/connectionForm";

export default function DevPage() {
    const [connected, setConnectedToBle] = useState(false);
    const [data, setBleData] = useState([]);
    const [reading, setReading] = useState(false);

    async function beginBleReading() {
        try {
            if (window.electronAPI) {
                await window.electronAPI.beginReadingData();
                setReading(() => true);
            }
        } catch (error) {
            console.error("Error starting BLE reading:", error);
        }
    }

    async function stopRecording() {
        try {
            if (window.electronAPI) {
                await window.electronAPI.stopRecordingData();
                setReading(() => false);
            }
        } catch (error) {
            console.error("Error stopping recording:", error);
        }
    }

    useEffect(() => {
        if (window.electronAPI) {
            window.electronAPI.onBLEData((newData) => {
                setBleData((prevData) => [...prevData, newData]);
            });
        }
    }, []);

    return (
        <div className={'flex flex-col items-center pt-24'}>
            <ConnectionForm connected={connected} setConnectedToBle={setConnectedToBle}/>
            {connected && (
                <div>
                    <button onClick={beginBleReading} className={`${(reading === true) ? ('bg-transparent border') : ('bg-green-700')} px-4 py-2  rounded-xl m-12`}>
                        Start
                    </button>
                    <button onClick={stopRecording} className={`${(reading === false) ? ('bg-transparent border') : ('bg-red-700')} px-4 py-2  rounded-xl m-12`}>
                        Stop
                    </button>
                </div>
            )}
            <ul className={'border p-4 rounded-xl'}>
                {data.map((item, index) => (
                    // Change this to {JSON.stringify(item)} if errors on decode
                    <li className={'p-2'} key={index}>{item}</li>
                ))}
            </ul>


        </div>
    );

}