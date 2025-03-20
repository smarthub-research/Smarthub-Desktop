'use client'
import Recorder from "./recorder";
import Connector from "./connector";
import Reviewer from "./reviewer";
import {useState} from "react";


export default function FullTrial() {
    const [connected, setConnected] = useState(false);

    return (
        <div className={'flex flex-col grow h-fit'}>

            <Connector setConnected={setConnected}/>
            {connected && (
                <>
                    <Recorder/>

                    {/*<Reviewer/>*/}
                </>
            )}
        </div>
    )

}