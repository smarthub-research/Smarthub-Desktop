'use client'

import {BarChart, Bar, ResponsiveContainer, XAxis} from "recharts";
import {useEffect, useState} from "react";

export default function UsageGraph({testFiles}) {
    const [chartData, setChartData] = useState([])
    // Go through each test file, count the number of files recorded based on their day
    // Use the created_at key in each testFile and then increase the count for the day that it occurred on
    useEffect(() => {
        const getData = () => {
            const map = new Map
            testFiles.map((test) => {
                const isoDate = test.created_at.slice(0, test.created_at.indexOf('T'));
                const dateObj = new Date(isoDate);

                // Format to MM/DD/YYYY
                const month = String(dateObj.getMonth() + 1);
                const day = String(dateObj.getDate());
                const year = dateObj.getFullYear();
                const formattedDate = `${month}/${day}/${year}`;

                // Use formatted date for the map
                if (map.has(formattedDate)) {
                    map.set(formattedDate, map.get(formattedDate) + 1);
                } else {
                    map.set(formattedDate, 1);
                }
            })
            const data = Array.from(map, ([date, count]) => ({
                date,
                count
            }));
            console.log(data)
            setChartData(data)
        }
        getData()
    }, [testFiles]);

    return (
        <ResponsiveContainer width={"100%"} height={"100%"} className={'col-span-2'}>
            <BarChart data={chartData}>
                <XAxis dataKey={"date"} />
                <Bar type={"monotone"} dataKey={"count"} stroke={'#000000'} fill={'#000000'}/>
            </BarChart>
        </ResponsiveContainer>
    )
}