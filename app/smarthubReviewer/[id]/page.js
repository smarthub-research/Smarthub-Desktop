'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import DemoChart from "../../smarthubRecorder/recorder/demoChart";
import Link from "next/link";
import TestName from "./testName";

export default function TestView() {
    const params = useParams();
    const id = params?.id;
    const [testData, setTestData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [testName,setTestName] = useState(null);

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

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-screen">
                <div className="bg-red-500/20 p-6 rounded-lg text-center max-w-md">
                    <h2 className="text-xl font-bold mb-2">Error</h2>
                    <p className="text-gray-300">{error}</p>
                    <Link href="/smarthubReviewer" className="mt-4 inline-block bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors">
                        Return to Test List
                    </Link>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="animate-pulse text-center">
                    <p className="mt-4 text-gray-400">Loading test data...</p>
                </div>
            </div>
        );
    }


    return (
        <div className="flex flex-col justify-center items-center gap-8 py-8 px-12">
            <div className={'self-start'}>
                <TestName testData={testData} setTestData={setTestData} id={id}/>
                <p className={'ml-12'}>Recorded on: {testData.created_at.slice(0, testData.created_at.indexOf('T'))}</p>
            </div>


            <div className={'flex flex-row gap-4 w-full'}>
                <div className="flex flex-col grow gap-8 w-3/4">
                    <DemoChart timeStamps={testData.timeStamp} data={testData.displacement} title={'Displacement vs Time'} graphId={1}/>
                    <DemoChart timeStamps={testData.timeStamp} data={testData.heading} title={'Heading vs Time'} graphId={2}/>
                    <DemoChart timeStamps={testData.timeStamp} data={testData.velocity} title={'Velocity vs Time'} graphId={3}/>
                    <DemoChart timeStamps={testData.trajectory_x} data={testData.trajectory_y} title={'Trajectory'} graphId={4}/>
                </div>

                <div className={'flex flex-col w-1/4 gap-4'}>
                    <div className={'bg-[#0a0a0a] p-4 rounded-xl'}>
                        <p className={'font-semibold'}>Comments</p>
                        {testData.comments ?(<p>{testData.comments}</p>) : (<p>No comments added</p>)}
                    </div>

                    <div>
                        <div className={'bg-[#0a0a0a] p-4 rounded-xl'}>
                        <p className={'font-semibold'}>Flags</p>
                        {testData?.flags?.length === 0 ? (
                                <p>No flags added</p>
                        ) : (
                            <>
                                {testData.flags.map((i, flag) => (
                                    <p key={i} className={'bg-[#0a0a0a] p-4 rounded-xl'}>{flag}</p>
                                ))}
                            </>
                        )}
                        </div>
                    </div>
                </div>


            </div>

        </div>
    );
}