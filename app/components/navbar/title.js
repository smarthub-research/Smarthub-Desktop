'use client'
import LogoSVG from "../svg/logoSVG";
import {useEffect, useState} from "react";

export default function Title() {
    const [isAtTop, setIsAtTop] = useState(true);

    useEffect(() => {
        const handleScroll = () => {
            setIsAtTop(window.scrollY === 0);
        };

        // Set initial state
        handleScroll();

        // Add event listener
        window.addEventListener('scroll', handleScroll);

        // Clean up
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    return (
        <div className={`relative flex items-center mb-4 justify-start transition-all`}>
            <LogoSVG/>
            <span className={`${isAtTop ? "opacity-100" : "opacity-0"} group-hover:opacity-100 absolute ml-12 whitespace-nowrap mb-2 transition-all duration-300 font-bold uppercase`}>
                <p>Smarthub</p>
                <p className={'text-xs font-medium leading-2'}>Desktop</p>
            </span>
        </div>

    )
}