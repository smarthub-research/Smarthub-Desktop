import SearchFilters from "./searchFilters";
import TestFileList from "./testFileList";

// Main reviewer page: displays filters and a paginated list of test files.
// Props:
// - searchParams: query params from Next.js router (used for filters/search)
export default async function ReviewerHomePage({ searchParams }) {
    // Parse filters and search term from query params
    const filters = {
        testName: (await searchParams)?.testName === 'true',
        date: (await searchParams)?.date === 'true',
        comments: (await searchParams)?.comments === 'true'
    };

    const searchTerm = (await searchParams)?.search || "";

    return (
        <div className="ml-16 min-h-screen grow p-6 mt-16">
            <div className="flex flex-col md:flex-row gap-6">
                {/* FILTERS SIDEBAR */}
                <SearchFilters filters={filters}/>

                {/* FILE LIST */}
                <div className="flex-1">
                    <TestFileList filters={filters} searchTerm={searchTerm}/>
                </div>
            </div>
        </div>
    );
}