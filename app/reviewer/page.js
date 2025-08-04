import SearchFilters from "./searchFilters";
import TestFileList from "./testFileList";

export default async function ReviewerHomePage({ searchParams }) {

    const filters = {
        testName: (await searchParams)?.testName === 'true',
        date: (await searchParams)?.date === 'true',
        comments: (await searchParams)?.comments === 'true'
    };

    const searchTerm = (await searchParams)?.search || "";

    return (
        <div className="min-h-screen grow p-6">
            <h1 className={'text-center font-bold text-2xl mb-4'}>Reviewer</h1>
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