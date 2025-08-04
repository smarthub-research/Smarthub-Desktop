import {BsFillFlagFill} from "react-icons/bs";
import {useFlagging} from "../context/flaggingContext";

export default function FlaggingButton() {
    const { handleFlagging } = useFlagging();

    return (
        <button
            onClick={handleFlagging}
            className={`flex justify-center items-center w-12 h-12 border border-gray-600
                    hover:bg-primary-400 bg-primary-500 rounded-full transition-colors text-white text-xl shadow-md`}>
            <BsFillFlagFill/>
        </button>
    )
}