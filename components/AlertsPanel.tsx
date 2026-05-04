import React from 'react';
import { Device } from '../types';
import { ShieldCheckIcon, ShieldOffIcon, MailIcon } from './icons';
import { getDeviceTypeIcon } from './DeviceList';
import DashboardCard from './DashboardCard';

interface AlertsPanelProps {
    devices: Device[];
    onTrust: (deviceId: string) => void;
    onBlock: (deviceId: string) => void;
}

const AlertsPanel: React.FC<AlertsPanelProps> = ({ devices, onTrust, onBlock }) => {
    return (
        <DashboardCard title="Action Required: New Devices" icon={<MailIcon className="h-5 w-5 text-primary-400" />} className="lg:col-span-2">
            <div className="h-64 overflow-y-auto space-y-3 pr-2">
                {devices.length > 0 ? (
                    devices.map(device => (
                        <div key={device.id} className="p-3 bg-light-bg dark:bg-slate-700/50 rounded-lg flex items-center justify-between animate-fade-in">
                            <div className="flex items-center space-x-3 overflow-hidden">
                                <div className="flex-shrink-0">{getDeviceTypeIcon(device.deviceType)}</div>
                                <div>
                                    <p className="font-mono text-xs text-light-text-primary dark:text-white">{device.mac}</p>
                                    <p className="text-xs text-light-text-secondary dark:text-slate-400 truncate" title={device.vendor}>{device.vendor}</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-2 flex-shrink-0">
                                <button onClick={() => onTrust(device.id)} className="p-2 rounded-md hover:bg-green-500/10 text-green-500 transition-colors" title="Trust Device">
                                    <ShieldCheckIcon className="h-5 w-5" />
                                </button>
                                <button onClick={() => onBlock(device.id)} className="p-2 rounded-md hover:bg-red-500/10 text-red-500 transition-colors" title="Block Device">
                                    <ShieldOffIcon className="h-5 w-5" />
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="flex items-center justify-center h-full text-center text-light-text-secondary dark:text-slate-500">
                        <div>
                            <ShieldCheckIcon className="h-10 w-10 mx-auto mb-2 text-green-500" />
                            <p>No new devices detected.</p>
                            <p className="text-xs">Your network is secure.</p>
                        </div>
                    </div>
                )}
            </div>
        </DashboardCard>
    );
};

export default AlertsPanel;
