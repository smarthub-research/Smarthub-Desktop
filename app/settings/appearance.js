import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "../components/ui/card";

export default function Appearance() {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle className="flex items-center gap-2">
                        Appearance
                    </CardTitle>
                    <CardDescription>Style Smarthub to your liking</CardDescription>
                </div>
            </CardHeader>

            <CardContent>
                stuff
            </CardContent>
        </Card>
    );
}