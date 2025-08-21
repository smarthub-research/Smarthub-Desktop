
// Set the tab so the correct chart is displayed
export default function ChartTabs({setActiveChartTab, activeChartTab}) {
    return (
        <div>
            <div className="flex bg-white rounded-lg p-0.5 shadow-sm">
                <button
                    className={`font-medium text-sm flex-1 px-4 py-2 rounded-sm transition-colors duration-200 cursor-pointer
                    ${activeChartTab === 'displacement' ? 'bg-primary-500 text-white' : 'hover:bg-surface-200'}`}
                    onClick={() => setActiveChartTab('displacement')}
                >
                    Displacement
                </button>
                <button
                    className={`font-medium text-sm flex-1 px-4 rounded-sm transition-colors duration-200 cursor-pointer 
                    ${activeChartTab === 'heading' ? 'bg-primary-500 text-white' : 'hover:bg-surface-200'}`}
                    onClick={() => setActiveChartTab('heading')}
                >
                    Heading
                </button>
                <button
                    className={`font-medium text-sm flex-1 px-4 rounded-sm transition-colors duration-200 cursor-pointer
                    ${activeChartTab === 'velocity' ? 'bg-primary-500 text-white' : 'hover:bg-surface-200'}`}
                    onClick={() => setActiveChartTab('velocity')}
                >
                    Velocity
                </button>
                <button
                    className={`font-medium text-sm flex-1 px-4 rounded-sm transition-colors duration-200 cursor-pointer
                    ${activeChartTab === 'trajectory' ? 'bg-primary-500 text-white' : 'hover:bg-surface-200'}`}
                    onClick={() => setActiveChartTab('trajectory')}
                >
                    Trajectory
                </button>
            </div>
        </div>
    )
}