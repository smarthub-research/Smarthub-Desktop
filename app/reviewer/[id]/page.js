"use client"

import { useState, useEffect, useCallback } from "react";
import { use } from "react";
import TestName from "./testName";
import DataDivider from "./dataDivider";
import GraphSection from "./graphSection";
import Compare from "./compare";
import Loading from "./loading";
import Metrics from "./metrics";
import ScreenshotButton from "./screenshotButton";

export default function TestView({ params }) {
    const unwrappedParams = use(params);
    const id = unwrappedParams.id;
    
    const [testData, setTestData] = useState(null);
    const [comparisonData, setComparisonData] = useState(null);
    const [loading, setLoading] = useState(true);

    // Fetch the main test data
    useEffect(() => {
        const fetchTestData = async () => {
            setLoading(true);
            try {
                const response = await fetch(`http://localhost:8000/db/tests/${id}?response_format=review`, {
                    method: "GET",
                });
                const data = await response.json();
                setTestData(data);
            } catch (error) {
                console.error('Error fetching test data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchTestData();
    }, [id]);

    const handleComparisonSelect = useCallback((data) => {
        setComparisonData(data);
    }, []);

    if (loading || !testData) {
        return <Loading />;
    }

    return (
        <div className="ml-16 grow flex flex-col items-center gap-4 py-8 px-12 min-h-screen">
            <div className="screenshot-container w-full flex flex-col gap-4">
                <div className={'flex justify-between items-start pt-6 w-full'}>
                    <div>
                        <TestName testData={testData} id={id} />
                        <p>Recorded on: {testData.created_at.slice(0, testData.created_at.indexOf('T'))}</p>
                    </div>
                    <ScreenshotButton testData={testData} />
                </div>
                
                <Compare onComparisonSelect={handleComparisonSelect} currentTestId={id} />

                <DataDivider testData={testData} comparisonData={comparisonData} />
                <GraphSection testData={testData} comparisonData={comparisonData} />
                <Metrics testData={testData} comparisonData={comparisonData} />
            </div>
        </div>
    );
}