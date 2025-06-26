import {FiDownload} from "react-icons/fi";
import {useTest} from "../context/testContext";

// Component to handle CSV download
export default function DownloadCSV() {
    const { testName } = useTest()

    const handleDownloadCSV = async () => {
        if (!window.electronAPI) return;

        try {
            await window.electronAPI.downloadCSV(testName);
        } catch (error) {
            console.error('Error downloading CSV:', error);
        }
    };

    return (
        <button
            onClick={handleDownloadCSV}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
            <FiDownload /> Download CSV
        </button>
    )
}