import {FiSave} from "react-icons/fi";
import {useRouter} from "next/navigation";
import {useTest} from "../context/testContext";

// Component to save test to database
export default function SaveTest() {
    const router = useRouter();
    const { testData, testName, testDistance, unitType, comments, allFlags } = useTest();

    const handleSaveTest = async () => {
        if (!window.electronAPI) return;

        // Call IPC function to save test data
        try {
            const distance = `${testDistance}${unitType}`;
            const flags = allFlags || [];
            const response = await fetch("http://localhost:8000/db/write_test", {
                method: "POST",
                headers: {
                    "content-type": "application/json"
                },
                body: JSON.stringify({
                    testData,
                    testName,
                    distance,
                    comments,
                    flags
                })
            })
            console.log(response)
            // Show success notification
            alert('Test saved successfully');
            router.push('/')
        } catch (error) {
            console.error('Error saving test:', error);
            alert('Failed to save test');
        }
    };

    return (
        <button
            onClick={handleSaveTest}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
            <FiSave /> Save Test
        </button>
    )
}