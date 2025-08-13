"use client"

import { useAuth } from "../../auth/authContext";
import { FaEnvelope, FaCheckCircle, FaClipboardList } from "react-icons/fa";
import {Card, CardHeader, CardTitle, CardContent} from "../ui/card";

export default function Analytics({ testFiles }) {
    const { user } = useAuth();
    const messages = 42;
    const recordedTests = user ? testFiles.reduce((acc, testFile) => {
        if (testFile.recorded_by_user_id === user.id) {
            return acc + 1;
        }
        return acc;
    }, 0) : 0;
    const newTests = 5;

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[10dvh]">
            <Card>
                <CardHeader>
                    <div className={'w-full flex flex-row justify-between'}>
                        <CardTitle>Messages</CardTitle>
                        <FaEnvelope className="text-blue-500 text-3xl mr-4" />
                    </div>
                </CardHeader>
                <CardContent>
                    <p className={'text-2xl font-bold'}>{messages}</p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <div className={'w-full flex flex-row justify-between'}>
                        <CardTitle>Recorded Tests</CardTitle>
                        <FaCheckCircle className="text-green-500 text-3xl mr-4" />
                    </div>
                </CardHeader>
                <CardContent>
                    <p className={'text-2xl font-bold'}>{recordedTests}</p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <div className={'w-full flex flex-row justify-between'}>
                        <CardTitle>Tests to Review</CardTitle>
                        <FaClipboardList className="text-yellow-500 text-3xl mr-4" />
                    </div>
                </CardHeader>
                <CardContent>
                    <p className={'text-2xl font-bold'}>{newTests}</p>
                </CardContent>
            </Card>
        </div>
    );
}