/**
 * Auth layout file
 *
 * This file creates the layout for the login and signup pages
 */
'use client';
import { useState } from 'react';
import VideoMask from "./videoMask";
import DraggableNav from "../components/draggableNav";
// `VideoMask` renders the decorative animated background on the left
// side of the auth layout. `DraggableNav` is imported here for future
// use in auth pages (kept intentionally even if unused currently).

/**
 * Auth component
 * @param children - children pages to receive this layout
 * @returns {JSX.Element} - Layout file
 * @constructor
 */
export default function Auth({ children }) {
    // Local UI state: controls whether the signup or login view
    // is currently displayed. This is used to swap prompt text and
    // simple fade transitions for the forms.
    const [isSigningUp, setIsSigningUp] = useState(false);

    return (
        <div className="m-0 flex w-screen h-screen">
            {/* Left Side: decorative animated mask. Visible on larger screens. */}
            <VideoMask />

            {/* Right Side: centered auth card containing branding and forms. */}
            <div className='m-auto '>
                <div className="bg-surface-50 border drop-shadow-2xl rounded-2xl grid grid-rows-3 justify-center px-8 py-4">
                    {/* Top: logo and welcome message. The prompt text switches
                        based on `isSigningUp` to reflect current form. */}
                    <div className="flex flex-col justify-center items-center row-span-1 self-end pb-2">
                        <img src={'/logo.png'} alt={'logo'} className={'size-16'}/>
                        <h1 className="text-2xl md:text-3xl font-semibold">Welcome to Smarthub</h1>
                        <p className={'opacity-50'}>Please {isSigningUp ? ('signup') : ('login')} below</p>
                    </div>

                    {/* Main: form container. `children` is expected to be the
                        login or signup form injected by the route. A small
                        opacity transition is applied when switching forms. */}
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