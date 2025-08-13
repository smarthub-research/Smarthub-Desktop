import BugSVG from "./svg/bugSVG";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "./ui/card";

export default function BugReporter() {
    return (
        <Card className="cursor-pointer transition-all hover:shadow-md hover:scale-[1.02]">
            <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100 dark:bg-red-900">
                        <BugSVG margin={0}/>
                    </div>
                    <CardTitle className="text-base">Bug Reporter</CardTitle>
                </div>
            </CardHeader>
            <CardContent>
                <CardDescription>Report and track issues</CardDescription>
            </CardContent>
        </Card>
    )
}