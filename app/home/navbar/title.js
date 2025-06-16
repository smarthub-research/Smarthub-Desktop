import LogoSVG from "../../svg/logoSVG";

export default function Title() {
    return (
        <div className={`flex items-center mb-4 justify-start transition-all`}>
            <LogoSVG/>
            <span className="whitespace-nowrap overflow-hidden max-w-0 group-hover:max-w-[200px] mb-2 transition-all duration-300 font-bold uppercase">
                    <p>Smarthub</p>
                    <p className={'text-xs font-medium leading-2'}>Desktop</p>
            </span>
        </div>

    )
}