
// Set the tab so the correct chart is displayed
export default function ChartTabs({setActiveChartTab, activeChartTab}) {
    return (
        <div className="flex border-b border-gray-500">
            <button
                className={`px-4 py-3 flex-1 ${activeChartTab === 'displacement' ? 'bg-blue-600 text-white' : 'hover:bg-surface-300'}`}
                onClick={() => setActiveChartTab('displacement')}
            >
                Displacement
            </button>
            <button
                className={`px-4 py-3 flex-1 ${activeChartTab === 'heading' ? 'bg-blue-600 text-white' : 'hover:bg-surface-300'}`}
                onClick={() => setActiveChartTab('heading')}
            >
                Heading
            </button>
            <button
                className={`px-4 py-3 flex-1 ${activeChartTab === 'velocity' ? 'bg-blue-600 text-white' : 'hover:bg-surface-300'}`}
                onClick={() => setActiveChartTab('velocity')}
            >
                Velocity
            </button>
            <button
                className={`px-4 py-3 flex-1 ${activeChartTab === 'trajectory' ? 'bg-blue-600 text-white' : 'hover:bg-surface-300'}`}
                onClick={() => setActiveChartTab('trajectory')}
            >
                Trajectory
            </button>
        </div>
    )
}