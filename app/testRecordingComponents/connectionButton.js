import Loader from "./Loader";

export default function ConnectionButton({ clickAction, status, connecting }) {
    const bgColor =
        status === "connected" ? "bg-green-700"
            : status === "notConnected" ? "bg-red-700"
                : status === "cannotConnect" ? "bg-[#262626]"
                    : "bg-black";

    const handleClick = () => {
        if (status === "cannotConnect") return; // Prevent click
        console.log("Button clicked with status:", status);
        clickAction();
    };

    if (connecting) {
        return (
            <div className={'w-[10rem] bg-[#262626] px-4 py-2 text-center rounded-xl'}>
                <Loader/>
            </div>
        )
    }

    return (
        <p
            onClick={handleClick}
            className={`${bgColor} w-[10rem] px-4 py-2 text-center rounded-xl cursor-pointer 
                ${status === "cannotConnect" ? "cursor-not-allowed opacity-50" : ""}`}
        >
            {status === "connected" ? "Connected"
                : status === "notConnected" ? "Not Connected"
                    : "Not Available"}
        </p>
    );
}
