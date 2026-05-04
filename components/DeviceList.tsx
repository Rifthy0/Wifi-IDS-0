

import React from 'react';
import { Device, DeviceStatus } from '../types';
import { 
    ShieldAlertIcon, CheckCircleIcon, AlertTriangleIcon, CpuIcon, ShieldCheckIcon, ShieldOffIcon, MapPinIcon,
    SmartphoneIcon, LaptopIcon, ServerIcon, TabletIcon, HelpCircleIcon, SignalStrengthIcon
} from './icons';

interface DeviceListProps {
  devices: Device[];
  onSelectDevice: (device: Device) => void;
  onTrust: (deviceId: string) => void;
  onBlock: (deviceId: string) => void;
}

const getStatusIndicator = (device: Device) => {
    if (device.isBlocked) {
        return { icon: <ShieldOffIcon className="h-5 w-5 text-red-500" title="Blocked" />, rowClass: 'opacity-60 bg-red-500/10 dark:bg-red-900/20 hover:bg-red-500/20 dark:hover:bg-red-900/30' };
    }
    const statusConfig = {
        [DeviceStatus.Trusted]: { icon: <CheckCircleIcon className="h-5 w-5 text-green-500" title={device.status} />, rowClass: '' },
        [DeviceStatus.Suspicious]: { icon: <AlertTriangleIcon className="h-5 w-5 text-yellow-400" title={device.status} />, rowClass: 'hover:bg-yellow-400/10 dark:hover:bg-slate-700/60' },
        [DeviceStatus.Unknown]: { icon: <ShieldAlertIcon className="h-5 w-5 text-slate-500" title={device.status} />, rowClass: 'hover:bg-slate-400/10 dark:hover:bg-slate-700/60' },
    };
    return statusConfig[device.status] || { icon: <ShieldAlertIcon className="h-5 w-5 text-slate-600" title="Status Unknown" />, rowClass: 'hover:bg-slate-500/10' };
};

export const getDeviceTypeIcon = (deviceType: string) => {
    const commonClass = "h-5 w-5 text-light-text-secondary dark:text-slate-400";
    switch (deviceType) {
        case 'Smartphone':
            return <SmartphoneIcon className={commonClass} title="Smartphone" />;
        case 'Laptop':
            return <LaptopIcon className={commonClass} title="Laptop" />;
        case 'Router/Switch':
        case 'Router':
            return <ServerIcon className={commonClass} title="Router/Switch" />;
        case 'Virtual Machine':
            return <ServerIcon className={commonClass} title="Virtual Machine" />;
        case 'Tablet':
            return <TabletIcon className={commonClass} title="Tablet" />;
        case 'IoT Device':
            return <CpuIcon className={commonClass} title="IoT Device" />;
        default:
            return <HelpCircleIcon className={commonClass} title="Unknown Device Type" />;
    }
};

const SignalStrengthIndicator: React.FC<{ rssi: number }> = ({ rssi }) => {
  const getSignalProps = (rssiVal: number) => {
    if (rssiVal >= -67) {
      return { level: 4, color: 'text-green-500', label: 'Excellent' };
    }
    if (rssiVal >= -80) {
      return { level: 3, color: 'text-yellow-500', label: 'Good' };
    }
    if (rssiVal >= -90) {
      return { level: 2, color: 'text-red-500', label: 'Fair' };
    }
    return { level: 1, color: 'text-red-500', label: 'Weak' };
  };

  const { level, color, label } = getSignalProps(rssi);

  return (
    <div className="flex items-center space-x-2" title={`${label} Signal (${rssi} dBm)`}>
      <SignalStrengthIcon className={`${color} h-5 w-5`} level={level} />
      <span className="text-light-text-primary dark:text-white text-xs">{rssi} dBm</span>
    </div>
  );
};


const ThreatScoreBar: React.FC<{ score: number }> = ({ score }) => {
    return (
        <div className="w-20 bg-slate-200 dark:bg-slate-700 rounded-full h-2.5">
            <div
                className="h-2.5 rounded-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500"
                style={{ width: `${score}%` }}
            ></div>
        </div>
    );
};


const DeviceList: React.FC<DeviceListProps> = ({ devices, onSelectDevice, onTrust, onBlock }) => {

  const sortedDevices = [...devices].sort((a, b) => {
    const statusOrder = { [DeviceStatus.Suspicious]: 0, [DeviceStatus.Unknown]: 1, [DeviceStatus.Trusted]: 2 };
    if (a.isBlocked && !b.isBlocked) return 1;
    if (!a.isBlocked && b.isBlocked) return -1;
    if (statusOrder[a.status] !== statusOrder[b.status]) {
      return statusOrder[a.status] - statusOrder[b.status];
    }
    return b.threatScore - a.threatScore;
  });

  return (
    <div className="overflow-y-auto h-full">
      <table className="w-full text-sm text-left text-light-text-secondary dark:text-slate-400">
        <thead className="text-xs text-light-text-secondary dark:text-slate-400 uppercase bg-light-bg dark:bg-slate-800/50 sticky top-0 z-10">
          <tr>
            <th scope="col" className="px-4 py-3">Status</th>
            <th scope="col" className="px-4 py-3">Threat Score</th>
            <th scope="col" className="px-4 py-3">Device Details</th>
            <th scope="col" className="px-4 py-3">Location</th>
            <th scope="col" className="px-4 py-3">Signal Strength</th>
            <th scope="col" className="px-4 py-3 text-center">Actions</th>
            <th scope="col" className="px-4 py-3">Reason</th>
          </tr>
        </thead>
        <tbody>
          {sortedDevices.map((device) => {
            const { icon, rowClass } = getStatusIndicator(device);
            return (
              <tr key={device.id} className={`border-b border-light-border dark:border-slate-700 transition-colors duration-200 cursor-pointer ${rowClass} animate-fade-in`} onClick={() => onSelectDevice(device)}>
                <td className="px-4 py-3">{icon}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center space-x-2">
                     <ThreatScoreBar score={device.threatScore} />
                     <span className="font-semibold text-light-text-primary dark:text-white text-xs w-6 text-right">{device.threatScore}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                    <div className="flex items-center space-x-2">
                        {getDeviceTypeIcon(device.deviceType)}
                        <div>
                            <div className="flex items-center space-x-2">
                                <div className="font-mono text-light-text-primary dark:text-white text-xs">{device.mac}</div>
                                {device.ssid && (
                                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary-500/10 text-primary-500 font-bold">
                                        {device.ssid}
                                    </span>
                                )}
                            </div>
                            <div className="text-xs text-light-text-secondary dark:text-slate-500 truncate max-w-[150px]" title={device.vendor}>{device.vendor}</div>
                        </div>
                    </div>
                </td>
                <td className="px-4 py-3 text-xs">
                    <div className="flex items-center space-x-1">
                        <MapPinIcon className="h-3 w-3" />
                        <span>{device.location}</span>
                    </div>
                </td>
                <td className="px-4 py-3">
                  <SignalStrengthIndicator rssi={device.rssi} />
                </td>
                 <td className="px-4 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-center space-x-1">
                    {!device.isBlocked && !device.isExplicitlyTrusted && (
                        <>
                            <button
                                onClick={() => onTrust(device.id)}
                                className="p-2 rounded-md hover:bg-green-500/10 text-green-500 transition-colors"
                                title="Trust Device"
                            >
                                <ShieldCheckIcon className="h-5 w-5" />
                            </button>
                            <button
                                onClick={() => onBlock(device.id)}
                                className="p-2 rounded-md hover:bg-red-500/10 text-red-500 transition-colors"
                                title="Block Device"
                            >
                                <ShieldOffIcon className="h-5 w-5" />
                            </button>
                        </>
                    )}
                    <button
                        onClick={() => onSelectDevice(device)}
                        className="p-2 rounded-md hover:bg-primary-500/10 text-primary-500 transition-colors"
                        title="Analyze Device"
                    >
                        <CpuIcon className="h-5 w-5" />
                    </button>
                  </div>
                </td>
                <td className="px-4 py-3 text-yellow-500 dark:text-yellow-400 text-xs italic truncate max-w-[150px]" title={device.suspicionReason}>
                  {device.status === DeviceStatus.Suspicious ? device.suspicionReason : 'N/A'}
                </td>
              </tr>
            )})}
           {devices.length === 0 && (
              <tr>
                  <td colSpan={7} className="text-center py-16 text-slate-500">
                      Start scanning to detect devices...
                  </td>
              </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default DeviceList;