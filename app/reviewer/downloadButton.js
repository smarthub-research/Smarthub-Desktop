import {FiDownload} from "react-icons/fi";

export default function DownloadButton({testFile}) {

    const handleDownload = async (testFile) => {
        try {
            await window.electronAPI.setTestData(testFile)
            await window.electronAPI.downloadCSV(testFile.test_name);
        } catch (err) {
            console.error("Error downloading file:", err);
        }
    };

    return (
        <button
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded flex items-center gap-2 transition-colors cursor-pointer"
            onClick={() => handleDownload(testFile)}
        >
            <FiDownload size={16} />
            <span>Download</span>
        </button>
    )
}