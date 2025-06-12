'use client'

import {AreaChart, Area, ResponsiveContainer} from "recharts";

export default function UsageGraph() {
    const data = [
        {
            date: "2025-1-1",
            test: 1
        },
        {
            date: "2025-1-1",
            test: 2
        },
        {
            date: "2025-1-1",
            test: 3
        },
        {
            date: "2025-1-1",
            test: 4
        }
    ]
    return (
        <ResponsiveContainer width={"100%"} height={"100%"} className={'bg-blue-400'}>
            <AreaChart width={100} height={75} data={data}>
                <Area type={"monotone"} dataKey={"test"} stroke={"#000000"} fill={'#000000'}/>
            </AreaChart>
        </ResponsiveContainer>
    )
}