'use client';

import React, {useEffect, useState} from 'react';
import {useParams} from 'next/navigation';
import TestName from "./testName";
import DataDivider from "./dataDivider";
import GraphSection from "./graphSection";
import Loading from "./loading";

export default function TestView() {
    const params = useParams();
    const id = params?.id;
    const [testData, setTestData] = useState(null);
    const [testName,setTestName] = useState(null);
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchTestData() {
            try {
                const data = await window.electronAPI.getReviewData();
                setTestData(data || {})
                setTestName(data.test_name)
            } catch (err) {
                console.error("Error fetching test data:", err);
                setError("Failed to load test data.");
            } finally {
                setLoading(false);
            }
        }
        fetchTestData();
    }, []);

    if (loading) {
        return (
            <Loading />
        )
    }

    return (
        <div className="flex flex-col items-center gap-8 py-8 px-12 h-screen">
            <div className={'self-start'}>
                <TestName testData={testData} setTestData={setTestData} id={id}/>
                <p className={'ml-12'}>Recorded on: {testData.created_at.slice(0, testData.created_at.indexOf('T'))}</p>
            </div>

            <DataDivider testData={testData}/>
            <GraphSection testData={testData}/>
        </div>
    );
}