// Fallback loading animation
export default function Loader() {
    return (
        <div className="h-full w-full flex items-center justify-center">
            <div className="animate-spin rounded-full h-24 w-24 border-t-8 border-b-8 border-blue-500"></div>
        </div>
    );
}
