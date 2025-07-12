/**
 * Creates the moving design on the left side of auth layout routes
 *
 */
import { useEffect } from "react";
import './auth.css';

/**
 * Animated video mask component
 * @returns {JSX.Element} - animated design
 * @constructor
 */
export default function VideoMask() {
    useEffect(() => {
        const element = document.querySelector('.moving-gradient');
        if (!element) return;

        const moveRandomly = () => {
            // Gradient position
            const xPos = Math.random() * 100;
            const yPos = Math.random() * 100;

            // Texture position (with smaller movement range for subtle effect)
            const textureX = Math.random() * 20;
            const textureY = Math.random() * 20;

            element.style.setProperty('--x-pos', `${xPos}%`);
            element.style.setProperty('--y-pos', `${yPos}%`);
            element.style.setProperty('--texture-x', `${textureX}%`);
            element.style.setProperty('--texture-y', `${textureY}%`);

            // Schedule next random movement
            setTimeout(moveRandomly, 3000 + Math.random() * 2000);
        };

        moveRandomly();
    }, []);

    return (
        <div className="hidden md:flex items-center justify-center h-full w-full p-1 relative">
            <span className={'h-full w-full moving-gradient rounded-lg'}/>
        </div>
    );
}