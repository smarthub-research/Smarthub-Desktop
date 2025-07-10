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
            await window.electronAPI.submitTestData({
                data: testData,
                name: testName,
                distance: `${testDistance}${unitType}`,
                comments: comments,
                flags: allFlags
            });

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