import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "../components/ui/card";

export default function Help() {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle className="flex items-center gap-2">
                        Help
                    </CardTitle>
                    <CardDescription>Find information about Smarthub</CardDescription>
                </div>
            </CardHeader>

            <CardContent>
                stuff
            </CardContent>
        </Card>
    );
}