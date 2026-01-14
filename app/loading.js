import Loader from "./components/loader";

/**
 * Loading
 * Minimal full-screen spinner shown while the app is initializing.
 * Note: the wrapper ensures center alignment and stable layout sizing.
 */
export default function Loading() {
    return (
        <div className="h-screen w-screen flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-3 border-blue-600"></div>
        </div>
    );
}