
import React, { useState, useEffect, useMemo } from 'react';
import { Device, DeviceStatus } from '../types';
import { analyzeDeviceWithGemini } from '../services/geminiService';
import { XIcon, CpuIcon, TrendingUpIcon, ShieldCheckIcon, ShieldOffIcon, ListChecksIcon, ShieldAlertIcon } from './icons';
import { getDeviceTypeIcon } from './DeviceList';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, AreaChart, Area } from 'recharts';
import DeviceTimeline from './DeviceTimeline';

interface DeviceDetailPanelProps {
    device: Device | null;
    onClose: () => void;
    onTrust: (deviceId: string) => void;
    onBlock: (deviceId: string) => void;
    theme: string;
}

const DeviceDetailPanel: React.FC<DeviceDetailPanelProps> = ({ device, onClose, onTrust, onBlock, theme }) => {
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisResult, setAnalysisResult] = useState('');
    const [activeTab, setActiveTab] = useState<'info' | 'history' | 'ai'>('info');

    useEffect(() => {
        if (device) {
            setAnalysisResult('');
            setIsAnalyzing(false);
            setActiveTab('info');
        }
    }, [device]);

    const handleAnalyze = async () => {
        if (!device) return;
        setIsAnalyzing(true);
        setAnalysisResult('');
        try {
            const result = await analyzeDeviceWithGemini(device);
            setAnalysisResult(result);
        } catch (error) {
            console.error("Gemini API error:", error);
            setAnalysisResult("Failed to analyze device. Please check the API key and console for more details.");
        } finally {
            setIsAnalyzing(false);
        }
    };
    
    const rssiChartData = useMemo(() => {
        return device?.rssiHistory.map((rssi, index) => ({ name: `T-${device.rssiHistory.length - index}`, rssi })) || [];
    }, [device]);

    const threatHistoryData = useMemo(() => {
      return device?.statusHistory.map((h) => ({
        time: new Date(h.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        score: h.threatScore
      })) || [];
    }, [device]);

    const tooltipStyle = theme === 'dark'
        ? { backgroundColor: '#1e293b', border: '1px solid #334155', color: '#cbd5e1', borderRadius: '0.5rem' }
        : { backgroundColor: '#FFFFFF', border: '1px solid #e2e8f0', color: '#1e293b', borderRadius: '0.5rem' };

    const statusConfig = {
        [DeviceStatus.Trusted]: 'text-green-500 bg-green-500/10',
        [DeviceStatus.Suspicious]: 'text-yellow-400 bg-yellow-400/10',
        [DeviceStatus.Unknown]: 'text-slate-500 bg-slate-500/10',
    };
    const statusClass = device?.isBlocked ? 'text-red-500 bg-red-500/10' : statusConfig[device?.status || DeviceStatus.Unknown];
    
    const isOpen = !!device;

    const TabButton = ({ id, icon, label }: { id: typeof activeTab, icon: React.ReactNode, label: string }) => (
      <button
        onClick={() => setActiveTab(id)}
        className={`flex-1 flex flex-col items-center py-2 border-b-2 transition-colors ${
          activeTab === id 
            ? 'border-primary-500 text-primary-500 bg-primary-500/5' 
            : 'border-transparent text-slate-500 hover:text-slate-400'
        }`}
      >
        {icon}
        <span className="text-[10px] font-bold mt-1 uppercase tracking-wider">{label}</span>
      </button>
    );

    return (
        <div className={`fixed top-0 right-0 h-full w-full max-w-md bg-light-card dark:bg-slate-800 border-l border-light-border dark:border-slate-700 shadow-2xl z-40 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
            <div className="flex flex-col h-full">
                {device && (
                    <>
                        <div className="flex justify-between items-center p-4 border-b border-light-border dark:border-slate-700 flex-shrink-0">
                            <div className="flex items-center space-x-3 overflow-hidden">
                                {getDeviceTypeIcon(device.deviceType)}
                                <div>
                                    <h2 className="text-lg font-bold text-light-text-primary dark:text-white truncate" title={device.mac}>{device.mac}</h2>
                                    <p className="text-xs text-light-text-secondary dark:text-slate-400 truncate" title={device.vendor}>{device.vendor}</p>
                                </div>
                            </div>
                            <button onClick={onClose} className="p-2 rounded-full text-light-text-secondary dark:text-slate-500 hover:bg-light-border dark:hover:bg-slate-700">
                                <XIcon className="h-6 w-6" />
                            </button>
                        </div>

                        {/* Navigation Tabs */}
                        <div className="flex flex-shrink-0 border-b border-light-border dark:border-slate-700">
                          <TabButton id="info" label="Snapshot" icon={<ShieldCheckIcon className="h-5 w-5" />} />
                          <TabButton id="history" label="Timeline" icon={<ListChecksIcon className="h-5 w-5" />} />
                          <TabButton id="ai" label="AI Analyze" icon={<CpuIcon className="h-5 w-5" />} />
                        </div>

                        <div className="flex-grow p-4 overflow-y-auto space-y-6">
                            {activeTab === 'info' && (
                              <div className="space-y-6 animate-fade-in">
                                {/* Device Info Grid */}
                                <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                                    <div className="font-semibold text-light-text-secondary dark:text-slate-400">Status</div>
                                    <div className={`px-2 py-0.5 rounded-full text-xs font-bold inline-block text-center ${statusClass}`}>{device.isBlocked ? 'Blocked' : device.status}</div>
                                    
                                    <div className="font-semibold text-light-text-secondary dark:text-slate-400">IP Address</div>
                                    <div className="font-mono">{device.ip}</div>
                                    
                                    <div className="font-semibold text-light-text-secondary dark:text-slate-400">Location</div>
                                    <div>{device.location}</div>
                                    
                                    <div className="font-semibold text-light-text-secondary dark:text-slate-400">Threat Score</div>
                                    <div className="font-bold">{device.threatScore} / 100</div>

                                    {device.suspicionReason && (
                                        <>
                                            <div className="font-semibold text-light-text-secondary dark:text-slate-400 col-span-2 mt-2">Current Flag</div>
                                            <div className="col-span-2 p-2 bg-yellow-500/10 border-l-4 border-yellow-500 text-yellow-600 dark:text-yellow-400 italic text-xs">
                                              {device.suspicionReason}
                                            </div>
                                        </>
                                    )}
                                </div>
                                
                                {/* RSSI Chart */}
                                <div className="pt-2">
                                    <h3 className="text-sm font-semibold text-light-text-primary dark:text-white mb-2 flex items-center tracking-tight">
                                      <TrendingUpIcon className="h-4 w-4 mr-2 text-primary-400"/>
                                      Live Signal Strength (RSSI)
                                    </h3>
                                    <div className="h-32 bg-slate-50 dark:bg-slate-900/50 rounded-lg p-2 border border-light-border dark:border-slate-700">
                                         <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart data={rssiChartData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                                                <defs>
                                                  <linearGradient id="colorRssi" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                                  </linearGradient>
                                                </defs>
                                                <XAxis dataKey="name" hide />
                                                <YAxis stroke={theme === 'dark' ? "#475569" : "#94a3b8"} fontSize={10} domain={[-100, -20]} />
                                                <Tooltip contentStyle={tooltipStyle} />
                                                <Area type="monotone" dataKey="rssi" name="RSSI" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorRssi)" dot={false} />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>
                                    <p className="text-[10px] text-slate-500 mt-1 text-right italic">Values in dBm. Closer to 0 is stronger.</p>
                                </div>
                              </div>
                            )}

                            {activeTab === 'history' && (
                              <div className="space-y-8 animate-fade-in">
                                 {/* Threat Score History */}
                                <div>
                                    <h3 className="text-sm font-semibold text-light-text-primary dark:text-white mb-3 flex items-center">
                                      <ShieldAlertIcon className="h-4 w-4 mr-2 text-red-400"/>
                                      Historical Threat Profile
                                    </h3>
                                    <div className="h-32 bg-slate-50 dark:bg-slate-900/50 rounded-lg p-2 border border-light-border dark:border-slate-700">
                                         <ResponsiveContainer width="100%" height="100%">
                                            <LineChart data={threatHistoryData} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme === 'dark' ? "#334155" : "#e2e8f0"} />
                                                <XAxis dataKey="time" stroke={theme === 'dark' ? "#475569" : "#94a3b8"} fontSize={9} />
                                                <YAxis stroke={theme === 'dark' ? "#475569" : "#94a3b8"} fontSize={9} domain={[0, 100]} />
                                                <Tooltip contentStyle={tooltipStyle} />
                                                <Line type="stepAfter" dataKey="score" name="Threat Score" stroke="#ef4444" strokeWidth={2} dot={false} />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                {/* Event Timeline */}
                                <div>
                                    <h3 className="text-sm font-semibold text-light-text-primary dark:text-white mb-4 flex items-center">
                                      <ListChecksIcon className="h-4 w-4 mr-2 text-primary-400"/>
                                      Event Timeline
                                    </h3>
                                    <DeviceTimeline history={device.statusHistory} />
                                </div>
                              </div>
                            )}

                            {activeTab === 'ai' && (
                              <div className="space-y-4 animate-fade-in">
                                <h3 className="text-sm font-semibold text-light-text-primary dark:text-white mb-2 flex items-center">
                                  <CpuIcon className="h-4 w-4 mr-2 text-primary-400"/>
                                  Generative Threat Assessment
                                </h3>
                                <div className="bg-light-bg dark:bg-slate-900/70 p-4 rounded-md min-h-[300px] text-sm border border-light-border dark:border-slate-700 shadow-inner">
                                    {isAnalyzing ? (
                                        <div className="flex flex-col items-center justify-center h-full space-y-4 py-12">
                                            <div className="relative">
                                              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
                                              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                                                <CpuIcon className="h-5 w-5 text-primary-500 animate-pulse" />
                                              </div>
                                            </div>
                                            <p className="text-xs text-light-text-secondary dark:text-slate-500">Consulting Gemini Neural Engine...</p>
                                        </div>
                                    ) : analysisResult ? (
                                        <div className="prose prose-sm dark:prose-invert">
                                          <pre className="whitespace-pre-wrap font-sans text-xs leading-relaxed text-light-text-primary dark:text-slate-300">
                                            {analysisResult}
                                          </pre>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center py-12 text-center">
                                            <CpuIcon className="h-12 w-12 text-slate-300 dark:text-slate-700 mb-4" />
                                            <p className="text-xs text-light-text-secondary dark:text-slate-500 max-w-[200px]">
                                              Request a specialized behavioral analysis for this identity.
                                            </p>
                                        </div>
                                    )}
                                </div>
                                <button
                                    onClick={handleAnalyze}
                                    disabled={isAnalyzing}
                                    className="w-full px-4 py-3 bg-primary-600 text-white rounded-md font-bold text-xs uppercase tracking-widest hover:bg-primary-700 transition-colors disabled:bg-slate-500 disabled:cursor-not-allowed flex items-center justify-center shadow-lg shadow-primary-500/20"
                                >
                                    <CpuIcon className="h-4 w-4 mr-2" />
                                    {isAnalyzing ? 'Processing Intelligence...' : 'Execute AI Analysis'}
                                </button>
                              </div>
                            )}
                        </div>

                        {!device.isBlocked && !device.isExplicitlyTrusted && (
                             <div className="p-4 border-t border-light-border dark:border-slate-700 flex-shrink-0 flex items-center space-x-3 bg-slate-50/50 dark:bg-slate-900/30">
                                <button onClick={() => onTrust(device.id)} className="flex-1 flex items-center justify-center space-x-2 px-3 py-3 text-xs font-bold uppercase tracking-wider bg-green-500/10 text-green-600 dark:text-green-400 rounded-md border border-green-500/20 hover:bg-green-500/20 transition-all">
                                    <ShieldCheckIcon className="h-4 w-4" />
                                    <span>Trust Identity</span>
                                </button>
                                <button onClick={() => onBlock(device.id)} className="flex-1 flex items-center justify-center space-x-2 px-3 py-3 text-xs font-bold uppercase tracking-wider bg-red-500/10 text-red-600 dark:text-red-400 rounded-md border border-red-500/20 hover:bg-red-500/20 transition-all">
                                    <ShieldOffIcon className="h-4 w-4" />
                                    <span>Blacklist</span>
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default DeviceDetailPanel;
