import { FiFileText } from 'react-icons/fi';
import TestNameInput from "./testNameInput";
import TestDistanceInput from "./testDistanceInput";
import TestDate from "./testDate";
import CommentSection from "./commentSection";

// Displays all test Information components
export default function TestInformation() {
    return (
        <div className="bg-[#1a1a1a] rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
                <FiFileText className="mr-2" /> Test Information
            </h2>
            <div className="space-y-4">
                <TestNameInput />
                <TestDistanceInput />
                <TestDate />
                <CommentSection />
            </div>
        </div>
    );
}
