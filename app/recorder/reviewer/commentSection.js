import {useTest} from "../context/testContext";

// Component to leave comments on the test
export default function CommentSection() {
    const {comments, setComments } = useTest()
    return (
        <div>
            <label className="block mb-2 text-sm font-medium text-gray-300">
                Additional Comments
            </label>
            <textarea
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder="Enter any additional comments or observations"
                className="w-full bg-[#252525] border border-gray-700 rounded-lg p-3 text-white min-h-[150px] focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
        </div>
    )
}