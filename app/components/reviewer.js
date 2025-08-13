import ReviewerSVG from "./svg/reviewerSVG";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "./ui/card";

// Component to display a card for the ReviewerTab feature
export default function Reviewer() {
    return (
        <Card className="cursor-pointer transition-all hover:shadow-md hover:scale-[1.02]">
            <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900">
                        <ReviewerSVG margin={0}/>
                    </div>
                    <CardTitle className="text-base">Reviewer</CardTitle>
                </div>
            </CardHeader>
            <CardContent>
                <CardDescription>Review and analyze test results</CardDescription>
            </CardContent>
        </Card>
    )
}