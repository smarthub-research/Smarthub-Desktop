import React from "react";

export default function DataDivider({testData}) {
    return (
        <div className={'grid grid-cols-4 justify-around text-center items-center w-full p-4 bg-[#2a2a2a] rounded-lg divide-x divide-gray-300/30'}>
            <div className={'px-6'}>
                <p className={'opacity-75 text-sm'}>Time Elapsed</p>
                <p className={'font-semibold text-xl'}>{(Number(testData.timeStamp.at(-1)) / 1000).toFixed(2)}s</p>
            </div>
            <div className={'px-6'}>
                <p className={'opacity-75 text-sm'}>Distance</p>
                <p className={'font-semibold text-xl'}>{testData.distance}</p>
            </div>
            <div className={'px-6'}>
                <p className={'opacity-75 text-sm'}>Flags</p>
                <p className={'font-semibold text-xl'}>{testData.flags.length}</p>
            </div>
            <div className={'px-6'}>
                <p className={'opacity-75 text-sm'}>Data Points</p>
                <p className={'font-semibold text-xl'}>{testData.timeStamp.length}</p>
            </div>
        </div>
    )
}