'use client';
import { useState } from 'react';
import Login from "./login";
import Signup from "./signup";
import VideoMask from "./videoMask";

export default function Auth() {
    const [isSigningUp, setIsSigningUp] = useState(false);

    return (
        <div className="grid md:grid-cols-2 grid-cols-1 w-screen h-screen">
            {/* Left Side */}
            <VideoMask />

            {/* Right Side */}
            <div className="grid grid-rows-4 justify-center px-6 relative">
                {/* Fixed position welcome message */}
                <div className="flex flex-col justify-center items-center row-span-1 self-end">
                    <img src={'/logo.png'} alt={'logo'} className={'size-16'}/>
                    <h1 className="text-2xl md:text-3xl font-semibold">Welcome to Smarthub</h1>
                    <p className={'opacity-50'}>Please {isSigningUp ? ('signup') : ('login')} below</p>
                </div>

                {/* Form container with fixed position */}
                <div className="w-full max-w-md row-span-2 self-center text-center">
                    <div className={`transition-opacity duration-300 ${!isSigningUp ? 'opacity-100' : 'opacity-0 hidden'}`}>
                        <Login />
                        <p className="text-sm  text-gray-600 mt-4">
                            Don't have an account?{' '}
                            <span className="underline cursor-pointer text-primary-400 hover:text-primary-500"
                                  onClick={() => setIsSigningUp(true)}>
                                Sign Up
                            </span>
                        </p>
                    </div>

                    <div className={`transition-opacity duration-300 ${isSigningUp ? 'opacity-100' : 'opacity-0 hidden'}`}>
                        <Signup />
                        <p className="text-sm text-gray-600 mt-4">
                            Already have an account?{' '}
                            <span className="underline cursor-pointer text-primary-400 hover:text-primary-500"
                                  onClick={() => setIsSigningUp(false)}>
                                Sign In
                            </span>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}