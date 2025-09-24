import TestName from "./testName";
import DataDivider from "./dataDivider";
import GraphSection from "./graphSection";

export default async function TestView({ params }) {
    const id = (await params).id;

    const response = await fetch("http://localhost:8000/db/tests/" + id + "?response_format=review", {
        method: "GET",
        cache: 'no-store'
    });
    const testData = await response.json();

    return (
        <div className="ml-16 grow flex flex-col items-center gap-4 py-8 px-12 min-h-screen">
            <div className={'self-start pt-6'}>
                <TestName testData={testData} id={id} />
                <p>Recorded on: {testData.created_at.slice(0, testData.created_at.indexOf('T'))}</p>
            </div>

            <DataDivider testData={testData}/>
            <GraphSection testData={testData}/>
        </div>
    );
}