import BugSVG from "../../svg/bugSVG";

export default function BugReporter() {
    return (
        <div className="group h-full block transform transition-transform duration-300 hover:-translate-y-1.5 cursor-pointer">
            <div className="relative overflow-hidden flex flex-row justify-between items-center bg-white text-red-700 group-hover:text-red-600 p-6 py-8 rounded-xl shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                <div className="absolute top-0 left-0 right-0 h-2 bg-red-500 transition-all duration-300 ease-out group-hover:bg-red-400 group-hover:h-3"></div>
                <h2 className="mt-3 text-2xl font-semibold mb-2  transition-colors duration-300">
                    BUG REPORTER
                </h2>
                <BugSVG/>
                {/*<p className="text-gray-600 group-hover:text-gray-500 text-sm transition-colors duration-300">*/}
                {/*    Report bugs from using your Smarthub Desktop application to alert the developer team of*/}
                {/*    potential issues throughout your user experience.*/}
                {/*</p>*/}
            </div>
        </div>
    )
}