
import {useRouter} from "next/navigation";

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
        <button
            className="bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded-lg transition-colors cursor-pointer"
            onClick={() => handleView(testFile)}
        >
            View
        </button>
    )
}