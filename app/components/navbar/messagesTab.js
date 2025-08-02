import MessagesSVG from "../svg/messagesSVG";

export default function MessagesTab({getItemClasses}) {
    return (
        <div className={getItemClasses('recorder')}>
            <MessagesSVG/>
            <span className="whitespace-nowrap overflow-hidden max-w-0 group-hover:ml-3 group-hover:max-w-[200px] transition-all duration-300">
                        Messages
            </span>
        </div>
    )
}