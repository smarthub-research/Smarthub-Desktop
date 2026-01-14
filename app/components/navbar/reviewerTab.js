/**
 * ReviewerTab Component
 * Renders the reviewer navigation tab with an icon and expandable text on hover.
 * Props:
 * - getItemClasses: Function to get CSS classes based on the current page
 */
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