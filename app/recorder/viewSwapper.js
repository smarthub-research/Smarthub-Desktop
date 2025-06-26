import {BsFillPauseFill, BsGrid, BsGridFill, BsViewStacked} from "react-icons/bs";
import React from "react";

export default function ViewSwapper({boxView, setBoxView}) {
    return (
        <div className={'flex flex-row gap-4   px-4 py-2 rounded-lg justify-center items-center'}>
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