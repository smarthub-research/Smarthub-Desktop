
import {useRouter} from "next/navigation";
import { Button } from "../components/ui/button";

export default function ViewButton({testFile}) {
    const router = useRouter();
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