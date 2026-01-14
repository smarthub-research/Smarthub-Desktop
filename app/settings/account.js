import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "../components/ui/card";

/**
 * Account
 * Simple settings card placeholder for account-related settings. Keep this
 * component small and focused so it can be expanded later with profile
 * editing controls, password management, etc.
 */
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
                {/* Placeholder content - replace with account UI */}
                stuff
            </CardContent>
        </Card>
    );
}