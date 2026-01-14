
import {useRouter} from "next/navigation";
import { Button } from "../components/ui/button";

// Button to navigate to the detailed view for a test file.
// Props:
// - testFile: object with id property.
export default function ViewButton({testFile}) {
    const router = useRouter();
    // Navigates to the test file's review page
    const handleView = async (testFile) => {
        try {
            router.push('/reviewer/' + testFile.id);
        } catch (err) {
            console.error("Error viewing file:", err);
        }
    }

    return (
        <Button
            className="flex items-center gap-2"
            variant="default"
            onClick={() => handleView(testFile)}
            onMouseEnter={() => router.prefetch('/reviewer/' + testFile.id)}
            title="View test"
        >
            View
        </Button>
    )
}