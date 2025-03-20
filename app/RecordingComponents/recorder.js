'use client'
import React, { useEffect, useState } from "react";
import Papa from "papaparse";
import DemoChart from "./demoChart";
import CalculatedData from "./calculatedData";

export default function Recorder({ connected }) {
    const [bleData, setBleData] = useState([]);
    const [testData, setTestData] = useState([]);

    // This is only for CSV parsing
    // DELETE LATER
    useEffect(() => {
        const fetchCSV = async () => {
            try {
                const response = await fetch("/test.csv");
                const text = await response.text();


                Papa.parse(text, {
                    header: true,
                    skipEmptyLines: true,
                    complete: (result) => {
                        setTestData([...result.data]);
                        console.log(result.data)
                    },
                });

                console.log(testData)
            } catch (error) {
                console.error("Error fetching CSV:", error);
            }
        };

        fetchCSV();
    }, []);

    async function beginBleReading() {
        try {
            if (window.electronAPI) {
                await window.electronAPI.beginReadingData();
            }
        } catch (error) {
            console.error("Error starting BLE reading:", error);
        }
    }
    async function stopRecording() {
        try {
            if (window.electronAPI) {
                await window.electronAPI.stopRecordingData();
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
        <div className={'flex flex-col gap-10 items-center py-12'}>
            {/* Table 1 */}
            <DemoChart data={testData}/>
            {/* Table 2 */}
            <DemoChart data={testData}/>
            {/* Table 3 */}
            <DemoChart data={testData}/>
            {/* Table 4 */}
            <DemoChart data={testData}/>
            {/* Numbers Data Table */}
            <CalculatedData data={testData} />
        </div>
    )
}