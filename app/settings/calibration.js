import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";

// Can be made into server component
export default function Calibration() {
    const [calibrations, setCalibrations] = useState([]);
    const [selectedId, setSelectedId] = useState(""); // FIX: define selectedId
    const [submitted, setSubmitted] = useState(false);

    useEffect(() => {
        const fetchCalibrations = async () => {
            try {
                const response = await fetch("http://localhost:8000/calibrate/all", {
                    method: "GET",
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                const data = await response.json();
                setCalibrations(data);
                if (data.length > 0) setSelectedId(data[0].id);
            } catch (error) {
                console.error(error)
            }
        }
        fetchCalibrations()
    }, [])

    const handleSelectChange = (e) => {
        setSelectedId(e.target.value);
        setSubmitted(false);
    };

    const handleSubmit = async () => {
        setSubmitted(true);
        // Find the selected calibration by ID
        const selectedCalibration = calibrations.find(c => String(c.id) === String(selectedId));
        if (!selectedCalibration) {
            console.error("No calibration selected");
            return;
        }
        // Send the calibration to be saved in backend
        await window.electronAPI.setCalibration(selectedCalibration);
        console.log("Calibration set");
    };

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle className="flex items-center gap-2">
                        Calibrations
                    </CardTitle>
                    <CardDescription>Manage your device calibrations</CardDescription>
                </div>
            </CardHeader>

            <CardContent className="flex">
                <div className="flex flex-row justify-between items-center w-full mt-2 gap-4">
                    <div className="relative grow max-w-xs">
                        <select
                            className="block w-full appearance-none rounded-lg border border-border bg-card px-4 py-2 pr-10 text-base text-foreground shadow-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-400 dark:bg-card dark:text-card-foreground dark:border-border transition-colors duration-200"
                            value={selectedId}
                            onChange={handleSelectChange}
                        >
                            {calibrations.map((calibration, index) => (
                                <option className="bg-card text-foreground dark:bg-card dark:text-card-foreground" key={calibration.id} value={calibration.id}>
                                    {calibration.calibrationName || `Calibration ${index+1}`}
                                </option>
                            ))}
                        </select>
                        {/* Custom arrow */}
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400 dark:text-gray-500">
                            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 14a1 1 0 01-.707-.293l-4-4a1 1 0 111.414-1.414L10 11.586l3.293-3.293a1 1 0 111.414 1.414l-4 4A1 1 0 0110 14z" clipRule="evenodd" />
                            </svg>
                        </div>
                    </div>
                    <button
                        className="px-4 py-2 rounded-lg bg-primary-500 text-white font-semibold shadow hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-400 transition-colors duration-200"
                        onClick={handleSubmit}
                        type="button"
                    >
                        Select
                    </button>
                </div>
            </CardContent>
            {submitted && (
                <div className="ml-4 text-green-600 dark:text-green-400 font-medium flex items-center">Selection submitted!</div>
            )}
        </Card>
    )
}