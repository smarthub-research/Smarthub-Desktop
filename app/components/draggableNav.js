
/**
 * DraggableNav Component
 * Provides a draggable area at the top of the screen for window dragging in the Electron application.
 */

export default function DraggableNav() {
    return (
        <span className={'absolute top-0 left-0 p-4 w-screen draggable'}></span>
    )
}