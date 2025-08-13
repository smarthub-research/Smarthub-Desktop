import Link from "next/link";
import RecorderSVG from "./svg/recorderSVG";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "./ui/card";

// Component to display a card for the RecorderTab feature
export default function Recorder() {
    return (
        <Card className="cursor-pointer transition-all hover:shadow-md hover:scale-[1.02]">
            <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900">
                        <RecorderSVG margin={0}/>
                    </div>
                    <CardTitle className="text-base">Recorder</CardTitle>
                </div>
            </CardHeader>
            <CardContent>
                <CardDescription>Start recording a new test session</CardDescription>
            </CardContent>
        </Card>
    )
}