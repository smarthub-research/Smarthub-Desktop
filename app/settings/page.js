'use client'

import Devices from "./devices";
import Tabs from "./tabs";
import {useState} from "react";
import Account from "./account";
import Appearance from "./appearance";
import Help from "./help";

export default function Settings() {
    const [page, setPage] = useState('devices');

    return (
        <div className="container mx-auto py-8 px-4 max-w-4xl mt-4">
            <h1 className="text-3xl font-bold text-center text-gray-800 pb-4">Settings</h1>

            <Tabs setPage={setPage} page={page}/>
            {page === "devices" ? <Devices/> : page === "account" ? <Account/> : page === "appearance" ? <Appearance/> : <Help/>}
        </div>
    );
}