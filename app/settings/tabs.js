export default function Tabs({setPage, page}) {
    return (
        <div>
            <div className="flex bg-white rounded-lg p-0.5 mb-6">
                <button onClick={() => setPage('devices')}
                        className={`${page === 'devices' && 'bg-black text-white'} font-medium text-sm flex-1 px-4 rounded-sm transition-colors duration-200 cursor-pointer`}
                >
                    Devices
                </button>
                <button onClick={() => setPage('account')}
                        className={`${page === 'account' && 'bg-black text-white'} font-medium text-sm flex-1 px-4 py-2 rounded-lg transition-colors duration-200 cursor-pointer`}
                >
                    Account
                </button>
                <button onClick={() => setPage('appearance')}
                        className={`${page === 'appearance' && 'bg-black text-white'} font-medium text-sm flex-1 px-4 py-2 rounded-lg transition-colors duration-200 cursor-pointer`}
                >
                    Appearance
                </button>
                <button onClick={() => setPage('help')}
                        className={`${page === 'help' && 'bg-black text-white'} font-medium text-sm flex-1 px-4 py-2 rounded-lg transition-colors duration-200 cursor-pointer`}
                >
                    Help
                </button>
            </div>
        </div>
    )
}