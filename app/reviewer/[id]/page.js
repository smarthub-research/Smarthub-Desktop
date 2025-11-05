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
    const [loadingFullData, setLoadingFullData] = useState(false);

    // Fetch the main test data (initially downsampled)
    useEffect(() => {
        const fetchTestData = async (fullData = false) => {
            if (!fullData) {
                setLoading(true);
            } else {
                setLoadingFullData(true);
            }
            
            try {
                const url = `http://localhost:8000/db/tests/${id}?response_format=review${fullData ? '&full_data=true' : ''}`;
                const response = await fetch(url, {
                    method: "GET",
                    // Add cache header to help with repeated loads
                    headers: {
                        'Cache-Control': 'max-age=300',
                    },
                });
                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                const data = await response.json();
                setTestData(data);
            } catch (error) {
                console.error('Error fetching test data:', error);
            } finally {
                if (!fullData) {
                    setLoading(false);
                } else {
                    setLoadingFullData(false);
                }
            }
        };

        fetchTestData(false);
    }, [id]);
    
    // Callback to fetch full data when user requests it
    const fetchFullData = useCallback(() => {
        const loadFullData = async () => {
            setLoadingFullData(true);
            try {
                const response = await fetch(`http://localhost:8000/db/tests/${id}?response_format=review&full_data=true`, {
                    method: "GET",
                });
                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                const data = await response.json();
                setTestData(data);
            } catch (error) {
                console.error('Error fetching full test data:', error);
            } finally {
                setLoadingFullData(false);
            }
        };

        loadFullData();
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
                <GraphSection 
                    testData={testData} 
                    comparisonData={comparisonData} 
                    onRequestFullData={fetchFullData}
                    loadingFullData={loadingFullData}
                />
                <Metrics testData={testData} comparisonData={comparisonData} />
            </div>
        </div>
    );
}