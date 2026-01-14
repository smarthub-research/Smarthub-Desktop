import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "../components/ui/card";

/**
 * Appearance
 * Small settings panel for theming and appearance preferences. Currently a
 * placeholder — intended to hold theme toggles, font size settings, and
 * other UI personalization controls.
 */
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
                {/* Placeholder content - implement theme controls here */}
                stuff
            </CardContent>
        </Card>
    );
}