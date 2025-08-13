import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "../components/ui/card";

export default function Account() {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle className="flex items-center gap-2">
                        Account
                    </CardTitle>
                    <CardDescription>Manage your account information</CardDescription>
                </div>
            </CardHeader>

            <CardContent>
                stuff
            </CardContent>
        </Card>
    );
}