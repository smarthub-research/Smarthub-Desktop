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
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchTestData() {
            try {
                const response = await fetch("http://localhost:8000/db/tests/" + id, {
                    method: "GET",
                });
                const data = await response.json();
                setTestData(data.data[0])
            } catch (err) {
                console.error("Error fetching test data:", err);
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
        <div className="grow flex flex-col items-center gap-4 py-8 px-12 min-h-screen">
            <div className={'self-start pt-8'}>
                <TestName testData={testData} setTestData={setTestData} id={id}/>
                <p>Recorded on: {testData.created_at.slice(0, testData.created_at.indexOf('T'))}</p>
            </div>

            <DataDivider testData={testData}/>
            <GraphSection testData={testData}/>
        </div>
    );
}