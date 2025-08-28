
export default function CalibrationSVG({margin=1}) {
    return (
        <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={`ml-${margin} size-6 shrink-0`}
        >
            <path
                d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
            />
            <circle
                cx="12"
                cy="9"
                r="2"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
            />
            <path
                d="M12 18L14 22L16 18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
            />
        </svg>
    )
}