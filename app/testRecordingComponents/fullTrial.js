import Recorder from "./recorder";
import Connector from "./connector";
import Reviewer from "./reviewer";


export default function FullTrial() {
    return (
        <div className={'flex flex-col grow h-fit ml-[20vw]'}>
            <Connector/>
            <Recorder/>
            <Reviewer/>
        </div>
    )

}