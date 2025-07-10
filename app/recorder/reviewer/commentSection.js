import {useTest} from "../context/testContext";

// Component to leave comments on the test
export default function CommentSection() {
    const {comments, setComments } = useTest()
    return (
        <div>
            <label className="block mb-2 text-sm font-medium opacity-50">
                Additional Comments
            </label>
            <textarea
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder="Enter any additional comments or observations"
                className="w-full bg-white border border-gray-500 rounded-lg p-3 min-h-[150px] focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
        </div>
    )
}