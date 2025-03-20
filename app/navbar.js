
export default function Navbar() {
    return (
        <div className={'fixed flex flex-col bg-[#0a0a0a] w-[20vw] h-[100vh]'}>
            <p className="font-bold text-[3vw] px-2 tracking-[0.3rem] leading-tight">SMARTHUB</p>
            <p className=" text-[2vw] px-2 tracking-[0.5rem] leading-[1.2rem]">RECORDER</p>
            <hr className={'white mt-4 mx-2'}/>
            <p className={'text-2xl px-1 mx-1 mt-10 py-4 rounded-lg'}>HOME</p>
            <p>Record Test</p>
            <p>Settings</p>
        </div>
    )
}