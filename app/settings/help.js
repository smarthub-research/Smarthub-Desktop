import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "../components/ui/card";

/**
 * Help
 * Placeholder for application help and documentation links. Intended to
 * contain FAQs, links to docs, and troubleshooting steps for users.
 */
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
                {/* Replace this placeholder with actual help content */}
                stuff
            </CardContent>
        </Card>
    );
}