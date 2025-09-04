import ChartTabs from "./chartTabs";
import React, {useEffect, useState} from "react";
import {useTest} from "../context/testContext";
import Graph from "../../components/graphs/graph";


// Component to display charts based on the active tab
export default function ChartReview() {
    const { fetchReviewData, testData: rawTestData } = useTest();
    const [activeChartTab, setActiveChartTab] = useState('displacement');
    const [testData, setTestData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadReviewData = async () => {
            if (rawTestData) {
                try {
                    const formattedData = await fetchReviewData();
                    setTestData(formattedData);
                    console.log(formattedData);
                } catch (error) {
                    console.error('Error fetching review data:', error);
                } finally {
                    setIsLoading(false);
                }
            } else {
                setIsLoading(false);
            }
        };

        loadReviewData();
    }, [rawTestData, fetchReviewData]);

    // Render the chart content based on the active tab
    const renderChartContent = () => {
        if (!testData) return <div className="p-8 text-center">No data available</div>;
        return (
            <>
                {activeChartTab === 'displacement' && (
                    <Graph data={testData.displacement}/>
                )}
                {activeChartTab === 'heading' && (
                    <Graph data={testData.heading}/>
                )}
                {activeChartTab === 'velocity' && (
                    <Graph data={testData.velocity}/>
                )}
                {activeChartTab === 'trajectory' && (
                    <Graph data={testData.trajectory}/>
                )}
            </>
        );
    };

    return (
        <div className={'flex flex-col gap-4 h-full'}>
            {/* Set the tab then render the correct chart */}
            <ChartTabs activeChartTab={activeChartTab} setActiveChartTab={setActiveChartTab}/>
            <div className="flex-1 min-h-0">
                {renderChartContent()}
            </div>
        </div>
    )
}