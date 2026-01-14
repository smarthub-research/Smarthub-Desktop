import { FiFileText } from 'react-icons/fi';
import TestNameInput from "./testNameInput";
import TestDate from "./testDate";
import CommentSection from "./commentSection";
import SaveTest from "./saveTest";
import {Card, CardContent, CardHeader} from "../../components/ui/card";

// Component that aggregates all test information input fields.
// Purpose: Provides a card-based layout for entering test metadata including name, date, and comments.
// Includes the save functionality in the header for easy access.
export default function TestInformation() {
    return (
        <Card>
            <CardHeader>
                <div className={"flex flex-row justify-between items-center"}>
                    <h2 className="text-xl font-semibold flex items-center">
                        <FiFileText className="mr-2" /> Test Information
                    </h2>
                    <SaveTest />
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <TestNameInput />
                    <TestDate />
                    <CommentSection />
                </div>
            </CardContent>
        </Card>
    );
}
