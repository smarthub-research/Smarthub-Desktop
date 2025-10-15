/**
 * Auth layout file
 *
 * This file creates the layout for the login and signup pages
 */
'use client';
import { useState } from 'react';
import VideoMask from "./videoMask";
import DraggableNav from "../components/draggableNav";

/**
 * Auth component
 * @param children - children pages to receive this layout
 * @returns {JSX.Element} - Layout file
 * @constructor
 */
export default function Auth({ children }) {
    const [isSigningUp, setIsSigningUp] = useState(false);

    return (
        <div className="m-0 flex w-screen h-screen">
            {/* Left Side */}
            <VideoMask />

            {/* Right Side */}
            <div className='m-auto '>
                <div className="bg-surface-50 border drop-shadow-2xl rounded-2xl grid grid-rows-3 justify-center px-8 py-4">
                    {/* Fixed position welcome message */}
                    <div className="flex flex-col justify-center items-center row-span-1 self-end pb-2">
                        <img src={'/logo.png'} alt={'logo'} className={'size-16'}/>
                        <h1 className="text-2xl md:text-3xl font-semibold">Welcome to Smarthub</h1>
                        <p className={'opacity-50'}>Please {isSigningUp ? ('signup') : ('login')} below</p>
                    </div>

                    {/* Form container with fixed position */}
                    <div className="w-full max-w-md row-span-2 self-center text-center">
                        <div className={`transition-opacity duration-300 ${!isSigningUp ? 'opacity-100' : 'opacity-0 hidden'}`}>
                            {children}
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
}