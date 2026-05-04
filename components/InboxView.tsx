import React from 'react';
import { Device } from '../types';
import { XIcon, InboxIcon, ShieldCheckIcon, ShieldOffIcon, MailIcon } from './icons';
import { getDeviceTypeIcon } from './DeviceList';

interface InboxViewProps {
  isOpen: boolean;
  onClose: () => void;
  devices: Device[];
  onTrust: (deviceId: string) => void;
  onBlock: (deviceId: string) => void;
}

const InboxView: React.FC<InboxViewProps> = ({ isOpen, onClose, devices, onTrust, onBlock }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in p-4">
      <div className="bg-light-card dark:bg-slate-800 border border-light-border dark:border-slate-700 rounded-lg shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-4 border-b border-light-border dark:border-slate-700 flex-shrink-0">
          <div className="flex items-center space-x-3">
            <InboxIcon className="h-6 w-6 text-primary-400" />
            <h2 className="text-xl font-bold text-light-text-primary dark:text-white">Inbox ({devices.length})</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-full text-light-text-secondary dark:text-slate-500 hover:bg-light-border dark:hover:bg-slate-700">
            <XIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="p-2 sm:p-4 flex-grow overflow-y-auto">
          {devices.length > 0 ? (
            <ul className="space-y-2">
              {devices.map((device) => (
                <li key={device.id} className="bg-light-bg dark:bg-slate-900/50 rounded-lg border border-light-border dark:border-slate-700/50 hover:border-primary-400/50 dark:hover:border-primary-500/50 transition-colors">
                  <div className="p-3 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-3 sm:space-y-0">
                    <div className="flex items-center space-x-4 flex-grow overflow-hidden">
                      <div className="flex-shrink-0">{getDeviceTypeIcon(device.deviceType)}</div>
                      <div className="flex-grow overflow-hidden">
                        <p className="text-sm font-semibold text-light-text-primary dark:text-white truncate">
                          New Device Detected
                        </p>
                        <p className="text-xs font-mono text-light-text-secondary dark:text-slate-400 truncate">
                          {device.mac}
                        </p>
                         <p className="text-xs text-light-text-secondary dark:text-slate-500 truncate" title={device.vendor}>
                          {device.vendor}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 flex-shrink-0 self-end sm:self-center">
                      <button onClick={() => onTrust(device.id)} className="flex items-center space-x-2 px-3 py-1.5 text-xs font-semibold bg-green-500/10 text-green-600 dark:text-green-400 rounded-md hover:bg-green-500/20 transition-colors">
                        <ShieldCheckIcon className="h-4 w-4" />
                        <span>Trust</span>
                      </button>
                      <button onClick={() => onBlock(device.id)} className="flex items-center space-x-2 px-3 py-1.5 text-xs font-semibold bg-red-500/10 text-red-600 dark:text-red-400 rounded-md hover:bg-red-500/20 transition-colors">
                        <ShieldOffIcon className="h-4 w-4" />
                        <span>Block</span>
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center text-light-text-secondary dark:text-slate-500">
              <MailIcon className="h-16 w-16 mx-auto mb-4 text-green-500/50" />
              <h3 className="text-lg font-semibold text-light-text-primary dark:text-white">All Caught Up!</h3>
              <p>Your inbox is empty.</p>
              <p className="text-xs mt-1">New device alerts will appear here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InboxView;