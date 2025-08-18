import { FiFileText } from 'react-icons/fi';
import TestNameInput from "./testNameInput";
import TestDistanceInput from "./testDistanceInput";
import TestDate from "./testDate";
import CommentSection from "./commentSection";
import SaveTest from "./saveTest";
import {Card, CardContent, CardHeader} from "../../components/ui/card";

// Displays all test Information components
export default function TestInformation() {
    return (
        <Card>
            <CardHeader>
                <div className={"flex flex-row justify-between items-center"}>
                    <h2 className="text-xl font-semibold flex items-center">
                        <FiFileText className="mr-2" /> Test Information
                    </h2>
                    <SaveTest allFlags={[]} />
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <TestNameInput />
                    <TestDistanceInput />
                    <TestDate />
                    <CommentSection />
                </div>
            </CardContent>
        </Card>
    );
}
