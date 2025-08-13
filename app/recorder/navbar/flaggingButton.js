import {BsFillFlagFill} from "react-icons/bs";
import {useFlagging} from "../context/flaggingContext";

export default function FlaggingButton({ enabled }) {
    const { handleFlagging } = useFlagging();

    return (
        <button
            onClick={handleFlagging}
            disabled={!enabled}
            className={`flex justify-center items-center w-12 h-12 border border-gray-600
                ${(!enabled) ? 'bg-primary-700 cursor-not-allowed opacity-60' : 'bg-primary-500 hover:bg-primary-400'}
                  rounded-full transition-colors text-white text-xl shadow-md`}>
            <BsFillFlagFill/>
        </button>
    )
}