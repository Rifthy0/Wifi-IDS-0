
import React, { useState, useMemo } from 'react';
import { Device, LogEntry, LogLevel, ThreatLevel, ChartDataPoint, HistoricalDataPoint, EmailSettings, AiInsight, DeviceStatus } from '../types';
import DeviceList from './DeviceList';
import ThreatIndicator from './ThreatIndicator';
import AlertsPanel from './AlertsPanel';
import DashboardCard from './DashboardCard';
import { BookOpenIcon, BrainCircuitIcon, GhostIcon, PieChartIcon, PowerIcon, BarChartIcon, TrendingUpIcon, DownloadIcon, ListChecksIcon, WifiIcon as MapIcon } from './icons';
import DeviceDistributionChart from './DeviceDistributionChart';
import EmailSettingsComponent from './EmailSettings';
import EventLog from './EventLog';
import AiInsightsPanel from './AiInsightsPanel';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import NetworkVisualizer from './NetworkVisualizer';

interface DashboardProps {
    stealthMode: boolean;
    setStealthMode: (mode: boolean) => void;
    theme: string;
    isScanning: boolean;
    setIsScanning: (isScanning: boolean) => void;
    learningMode: boolean;
    setLearningMode: (mode: boolean) => void;
    adaptiveAiMode: boolean;
    setAdaptiveAiMode: (mode: boolean) => void;
    devices: Device[];
    logEntries: LogEntry[];
    threatLevel: ThreatLevel;
    chartData: ChartDataPoint[];
    historicalData: HistoricalDataPoint[];
    isAlerting: boolean;
    handleTrustDevice: (deviceId: string) => void;
    handleBlockDevice: (deviceId: string) => void;
    handleExportLogs: () => void;
    addLogEntry: (message: string, level: LogLevel) => void;
    deviceCounts: { trusted: number, suspicious: number, unknown: number, blocked: number };
    devicesNeedingAction: Device[];
    alertAudioRef: React.RefObject<HTMLAudioElement>;
    emailSettings: EmailSettings;
    onSaveEmailSettings: (settings: EmailSettings) => void;
    onSendTestEmail: (settings: EmailSettings) => void;
    aiInsight: AiInsight | null;
    selectedDevice: Device | null;
    onSelectDevice: (device: Device | null) => void;
}

const Dashboard: React.FC<DashboardProps> = ({
    stealthMode, setStealthMode, theme, isScanning, setIsScanning,
    learningMode, setLearningMode, adaptiveAiMode, setAdaptiveAiMode,
    devices, logEntries, threatLevel, chartData, historicalData,
    isAlerting, handleTrustDevice, handleBlockDevice,
    handleExportLogs, addLogEntry, deviceCounts,
    devicesNeedingAction, alertAudioRef, emailSettings,
    onSaveEmailSettings, onSendTestEmail, aiInsight, onSelectDevice
}) => {
    
    const [deviceFilter, setDeviceFilter] = useState<string>('All');
    const [viewMode, setViewMode] = useState<'map' | 'list'>('map');

    const filteredDevices = useMemo(() => {
        if (deviceFilter === 'All') {
            return devices;
        }
        return devices.filter(d => {
            if (deviceFilter === 'Blocked') return d.isBlocked;
            // When filtering by a status, exclude blocked devices unless explicitly filtering for 'Blocked'
            if (d.isBlocked) return false;
            return d.status === deviceFilter;
        });
    }, [devices, deviceFilter]);

    const isHighOrCritical = threatLevel === ThreatLevel.High || threatLevel === ThreatLevel.Critical;

    const tooltipStyle = theme === 'dark'
        ? { backgroundColor: '#1e293b', border: '1px solid #334155', color: '#cbd5e1', borderRadius: '0.5rem' }
        : { backgroundColor: '#FFFFFF', border: '1px solid #e2e8f0', color: '#1e293b', borderRadius: '0.5rem' };

    const filterOptions = [
        { label: 'All Devices', value: 'All', count: devices.length },
        { label: 'Trusted', value: DeviceStatus.Trusted, count: deviceCounts.trusted },
        { label: 'Suspicious', value: DeviceStatus.Suspicious, count: deviceCounts.suspicious },
        { label: 'Unknown', value: DeviceStatus.Unknown, count: deviceCounts.unknown },
        { label: 'Blocked', value: 'Blocked', count: deviceCounts.blocked },
    ];
    
    const HeaderControls = (
        <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-light-text-secondary dark:text-slate-500">Filter Status:</span>
                <select
                    value={deviceFilter}
                    onChange={(e) => setDeviceFilter(e.target.value)}
                    className="bg-light-bg dark:bg-slate-700 border border-light-border dark:border-slate-600 rounded-md px-3 py-1 text-xs font-semibold text-light-text-primary dark:text-slate-200 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all cursor-pointer shadow-sm hover:border-primary-400 dark:hover:border-slate-500"
                    aria-label="Filter detected devices by status"
                >
                    {filterOptions.map(option => (
                        <option key={option.value} value={option.value}>
                            {option.label} ({option.count})
                        </option>
                    ))}
                </select>
            </div>
            <div className="bg-light-bg dark:bg-slate-700 p-1 rounded-md flex border border-light-border dark:border-slate-600 shadow-sm">
                <button 
                    onClick={() => setViewMode('map')} 
                    className={`px-2.5 py-1 rounded transition-all duration-200 ${viewMode === 'map' ? 'bg-primary-500 text-white shadow-md shadow-primary-500/20' : 'text-light-text-secondary dark:text-slate-400 hover:text-light-text-primary dark:hover:text-slate-200'}`}
                    title="Map View"
                >
                    <MapIcon className="h-4 w-4" />
                </button>
                <button 
                    onClick={() => setViewMode('list')} 
                    className={`px-2.5 py-1 rounded transition-all duration-200 ${viewMode === 'list' ? 'bg-primary-500 text-white shadow-md shadow-primary-500/20' : 'text-light-text-secondary dark:text-slate-400 hover:text-light-text-primary dark:hover:text-slate-200'}`}
                    title="List View"
                >
                    <ListChecksIcon className="h-4 w-4" />
                </button>
            </div>
        </div>
    );

    return (
        <div className="space-y-6">
            <audio ref={alertAudioRef} src="https://aistudio.google.com/static/sounds/alert.mp3" preload="auto" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <DashboardCard title="System Control" className="lg:col-span-1">
                    <div className="flex flex-col items-center justify-center space-y-4 text-center min-h-[170px]">
                        <div className="flex flex-col items-center space-y-2">
                            <button
                                onClick={() => setIsScanning(!isScanning)}
                                className={`relative flex items-center justify-center w-20 h-20 rounded-full transition-all duration-300 ease-in-out shadow-lg focus:outline-none focus:ring-4
                                    ${isScanning 
                                        ? 'bg-red-500 hover:bg-red-600 text-white focus:ring-red-400/50' 
                                        : 'bg-primary-600 hover:bg-primary-700 text-white focus:ring-primary-400/50'
                                    }`}
                            >
                                {isScanning && <span className="absolute h-full w-full rounded-full bg-red-500 animate-pulse-fast opacity-75"></span>}
                                <PowerIcon className="h-8 w-8" />
                            </button>
                            <span className="text-sm font-semibold">{isScanning ? 'Scanning...' : 'Start Scan'}</span>
                        </div>

                        <div className="grid grid-cols-3 gap-4 w-full pt-2">
                            {/* Learning Mode */}
                            <div className="flex flex-col items-center space-y-1">
                                <BookOpenIcon className="h-5 w-5 text-light-text-secondary dark:text-slate-400" />
                                <label htmlFor="learning-toggle" className="text-xs text-light-text-secondary dark:text-slate-400">Learning</label>
                                <button
                                    id="learning-toggle"
                                    onClick={() => setLearningMode(!learningMode)}
                                    className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${learningMode ? 'bg-primary-500' : 'bg-slate-300 dark:bg-slate-700'}`}
                                >
                                    <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${learningMode ? 'translate-x-6' : 'translate-x-1'}`} />
                                </button>
                            </div>
                            {/* Stealth Mode */}
                            <div className="flex flex-col items-center space-y-1">
                                <GhostIcon className="h-5 w-5 text-light-text-secondary dark:text-slate-400" />
                                <label htmlFor="stealth-toggle" className="text-xs text-light-text-secondary dark:text-slate-400">Stealth</label>
                                <button
                                    id="stealth-toggle"
                                    onClick={() => {
                                        const newMode = !stealthMode;
                                        setStealthMode(newMode);
                                        addLogEntry(`Stealth mode ${newMode ? 'enabled' : 'disabled'}.`, LogLevel.Info);
                                    }}
                                    className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${stealthMode ? 'bg-primary-500' : 'bg-slate-300 dark:bg-slate-700'}`}
                                >
                                    <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${stealthMode ? 'translate-x-6' : 'translate-x-1'}`} />
                                </button>
                            </div>
                            {/* Adaptive AI */}
                            <div className="flex flex-col items-center space-y-1">
                                <BrainCircuitIcon className="h-5 w-5 text-light-text-secondary dark:text-slate-400" />
                                <label htmlFor="adaptive-ai-toggle" className="text-xs text-light-text-secondary dark:text-slate-400">Adaptive AI</label>
                                <button
                                    id="adaptive-ai-toggle"
                                    onClick={() => {
                                        const newMode = !adaptiveAiMode;
                                        setAdaptiveAiMode(newMode);
                                        addLogEntry(`Adaptive AI mode ${newMode ? 'enabled' : 'disabled'}.`, LogLevel.Info);
                                    }}
                                    className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${adaptiveAiMode ? 'bg-primary-500' : 'bg-slate-300 dark:bg-slate-700'}`}
                                >
                                    <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${adaptiveAiMode ? 'translate-x-6' : 'translate-x-1'}`} />
                                </button>
                            </div>
                        </div>
                    </div>
                </DashboardCard>
                <DashboardCard className={`lg:col-span-1 transition-all duration-300 ${isAlerting && isHighOrCritical ? 'animate-glow border-red-500' : ''}`}>
                    <ThreatIndicator level={threatLevel} />
                </DashboardCard>
                <AiInsightsPanel insight={aiInsight} />
                <DashboardCard title="Device Distribution" icon={<PieChartIcon className="h-5 w-5 text-primary-400"/>} className="lg:col-span-1">
                    <div className="h-[150px] -mx-4 -my-2 flex items-center justify-center">
                        <DeviceDistributionChart data={deviceCounts} theme={theme} />
                    </div>
                </DashboardCard>
            </div>

            <DashboardCard title={`Identity Discovery (${filteredDevices.length})`} headerContent={HeaderControls}>
                <div className="h-[500px] relative rounded-b-lg overflow-hidden border border-light-border dark:border-slate-700/50">
                    {viewMode === 'map' ? (
                        <NetworkVisualizer devices={filteredDevices} onSelectDevice={onSelectDevice} theme={theme} />
                    ) : (
                        <DeviceList devices={filteredDevices} onSelectDevice={onSelectDevice} onTrust={handleTrustDevice} onBlock={handleBlockDevice} />
                    )}
                </div>
            </DashboardCard>
            
             <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <AlertsPanel 
                    devices={devicesNeedingAction} 
                    onTrust={handleTrustDevice} 
                    onBlock={handleBlockDevice} 
                />
                <EmailSettingsComponent
                    settings={emailSettings}
                    onSave={onSaveEmailSettings}
                    onTest={onSendTestEmail}
                />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                 <DashboardCard title="Network Activity" icon={<BarChartIcon className="h-5 w-5 text-primary-400"/>} className="lg:col-span-3">
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" className="stroke-light-border dark:stroke-slate-700" />
                                <XAxis dataKey="time" stroke={theme === 'dark' ? "#94a3b8" : "#475569"} fontSize={12} />
                                <YAxis stroke={theme === 'dark' ? "#94a3b8" : "#475569"} fontSize={12} allowDecimals={false} />
                                <Tooltip contentStyle={tooltipStyle} />
                                <Legend wrapperStyle={{ fontSize: "14px" }} />
                                <Line type="monotone" dataKey="trusted" stroke="#4ade80" strokeWidth={2} name="Trusted" dot={false} />
                                <Line type="monotone" dataKey="suspicious" stroke="#facc15" strokeWidth={2} name="Suspicious" dot={false} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </DashboardCard>
                <DashboardCard title="Threats Over Time" icon={<TrendingUpIcon className="h-5 w-5 text-primary-400"/>} className="lg:col-span-2">
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={historicalData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" className="stroke-light-border dark:stroke-slate-700" />
                                <XAxis dataKey="name" stroke={theme === 'dark' ? "#94a3b8" : "#475569"} fontSize={12} />
                                <YAxis stroke={theme === 'dark' ? "#94a3b8" : "#475569"} fontSize={12} allowDecimals={false} />
                                <Tooltip contentStyle={tooltipStyle} cursor={{fill: theme === 'dark' ? 'rgba(148, 163, 184, 0.1)' : 'rgba(203, 213, 225, 0.3)'}} />
                                <Bar dataKey="threats" name="Threats Detected" fill={theme === 'dark' ? '#f87171' : '#ef4444'} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </DashboardCard>
            </div>
            
             <DashboardCard title="Event Log" headerContent={(
                <button onClick={handleExportLogs} className="flex items-center space-x-2 text-xs text-primary-400 hover:text-primary-500 font-semibold transition-colors" title="Export event log to CSV">
                    <DownloadIcon className="h-4 w-4" />
                    <span>Export CSV</span>
                </button>
            )}>
                <div className="h-[300px] overflow-y-auto">
                    <EventLog entries={logEntries} />
                </div>
            </DashboardCard>
        </div>
    );
};

export default Dashboard;
