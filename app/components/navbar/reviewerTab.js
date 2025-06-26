import ReviewerSVG from "../svg/reviewerSVG";

export default function ReviewerTab({getItemClasses}) {
    return (
        <div className={getItemClasses('reviewer')}>
            <ReviewerSVG/>
            <span className="whitespace-nowrap overflow-hidden max-w-0 group-hover:ml-3 group-hover:max-w-[200px] transition-all duration-300">
                        Reviewer
            </span>
        </div>
    )
}