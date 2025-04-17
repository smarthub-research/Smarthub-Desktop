'use client'
import Connector from "./connector/page";

const Page = () => {
    return (
        <div className={'flex flex-col h-[90vh] w-[100vw] overflow-x-hidden'}>
            <Connector/>
        </div>
    );
};


export default Page;
