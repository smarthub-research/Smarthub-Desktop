import {BsFillPauseFill, BsGrid, BsGridFill, BsViewStacked} from "react-icons/bs";
import React from "react";

// Component that provides a toggle between grid and stacked view modes for charts.
// Props:
// - `boxView`: boolean indicating current view mode (true = grid, false = stacked)
// - `setBoxView`: setter function to toggle the view mode
export default function ViewSwapper({boxView, setBoxView}) {
    return (
        <div className={'ml-16 flex flex-row gap-4 cursor-pointer py-2 rounded-lg justify-center items-center'}>
            {boxView ? (
                <>
                    <BsViewStacked onClick={(() => setBoxView(!boxView))}/>
                    <BsGridFill className={'scale-110'}/>
                </>

            ) : (
                <>
                    <BsFillPauseFill className={'rotate-90 scale-200'}/>
                    <BsGrid onClick={(() => setBoxView(!boxView))}  className={'scale-110'}/>
                </>
            )}
        </div>
    )
}
