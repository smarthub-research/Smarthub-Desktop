import {FiSave} from "react-icons/fi";
import {useRouter} from "next/navigation";
import {useTest} from "../context/testContext";

// Component for saving the completed test to the database.
// Purpose: Handles the test saving process, including waiting for backend data readiness and API calls.
// Polls the backend to ensure test file ID is available before saving metadata.
export default function SaveTest() {
    const router = useRouter();
    const { testName, comments } = useTest();

    // Handles the complete test saving workflow
    const handleSaveTest = async () => {
        if (!window.electronAPI) return;

        // Call IPC function to save test data
        try {
            // Poll the backend to wait for test_file_id to be available
            let attempts = 0;
            const maxAttempts = 50; // 5 seconds max wait time
            let testFileIdAvailable = false;
            
            console.log('Starting to poll for test_file_id...');
            
            while (attempts < maxAttempts && !testFileIdAvailable) {
                try {
                    // Check if test file ID is available
                    const checkResponse = await fetch("http://localhost:8000/db/check_test_file_id", {
                        method: "GET",
                    });
                    
                    if (checkResponse.ok) {
                        const checkData = await checkResponse.json();
                        console.log(`Attempt ${attempts + 1}: test_file_id =`, checkData.test_file_id);
                        
                        if (checkData.test_file_id !== null) {
                            testFileIdAvailable = true;
                            console.log('Test file ID is now available:', checkData.test_file_id);
                            break;
                        }
                    } else {
                        console.log(`Attempt ${attempts + 1}: Response not OK, status:`, checkResponse.status);
                    }
                } catch (e) {
                    console.log(`Attempt ${attempts + 1}: Error checking test_file_id:`, e);
                }
                
                await new Promise(resolve => setTimeout(resolve, 100));
                attempts++;
            }
            
            if (!testFileIdAvailable) {
                console.error(`Failed after ${attempts} attempts. Test data not ready.`);
                throw new Error('Test data not ready. Please try again in a moment.');
            }
            
            console.log('Proceeding to save test info...');
            
            // Save test metadata to database
            const response = await fetch("http://localhost:8000/db/write_test", {
                method: "POST",
                headers: {
                    "content-type": "application/json"
                },
                body: JSON.stringify({
                    testName,
                    comments,
                })
            })
            
            console.log('Response status:', response.status);
            
            if (!response.ok) {
                const errorData = await response.json();
                console.error('Error response:', errorData);
                throw new Error(errorData.detail || 'Failed to save test');
            }
            
            const data = await response.json();
            console.log('Success response:', data);
            
            // Show success notification
            alert('Test saved successfully');
            router.push('/');
        } catch (error) {
            console.error('Error saving test:', error);
            alert(`Failed to save test: ${error.message}`);
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