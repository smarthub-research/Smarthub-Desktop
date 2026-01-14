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
        // Select the element that will receive animated CSS variables.
        // The `.moving-gradient` element is styled in `auth.css` and
        // consumes the `--*` custom properties set below.
        const element = document.querySelector('.moving-gradient');
        if (!element) return;

        // Update CSS variables on a loop to create an organic movement.
        // We randomize a large-range gradient position and a smaller
        // texture offset to produce a subtle parallax effect.
        const moveRandomly = () => {
            // Main gradient position across the element (0-100%).
            const xPos = Math.random() * 100;
            const yPos = Math.random() * 100;

            // Texture offsets use a smaller range for subtle motion.
            const textureX = Math.random() * 20;
            const textureY = Math.random() * 20;

            element.style.setProperty('--x-pos', `${xPos}%`);
            element.style.setProperty('--y-pos', `${yPos}%`);
            element.style.setProperty('--texture-x', `${textureX}%`);
            element.style.setProperty('--texture-y', `${textureY}%`);

            // Re-trigger after a randomized delay so motion feels natural.
            setTimeout(moveRandomly, 3000 + Math.random() * 2000);
        };

        // Kick off the animation loop on mount.
        moveRandomly();
        // Note: this implementation does not persist timeout IDs to
        // perform cleanup on unmount. If strict cleanup is required,
        // convert the timeout into a ref and clear it in a return
        // cleanup function.
    }, []);

    return (
        // Positioned behind the auth panel. Hidden on small screens and
        // visible on `md`+ via utility classes. The single span fills
        // the container and is the target for CSS variable updates.
        <div className="absolute -z-10 hidden md:flex items-center justify-center h-full w-full">
            <span className={'h-full w-full moving-gradient'}/>
        </div>
    );
}