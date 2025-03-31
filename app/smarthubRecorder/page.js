'use client'
import Connector from "./connector/page";
import {useRouter} from "next/navigation";

const Page = () => {
    const router = useRouter()

    return (
        <div className={'flex flex-col h-[90vh] w-[100vw] overflow-x-hidden'}>
            <Connector/>
        </div>
    );
};


export default Page;
