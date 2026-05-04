import React, { useState } from 'react';
import { XIcon, ListChecksIcon, Trash2Icon } from './icons';

interface TrustedDevicesManagerProps {
  isOpen: boolean;
  onClose: () => void;
  trustedMacs: string[];
  onAdd: (mac: string) => void;
  onRemove: (mac: string) => void;
}

const TrustedDevicesManager: React.FC<TrustedDevicesManagerProps> = ({ isOpen, onClose, trustedMacs, onAdd, onRemove }) => {
  const [newMac, setNewMac] = useState('');

  if (!isOpen) return null;

  const handleAddClick = () => {
    if (newMac.trim()) {
      onAdd(newMac.trim());
      setNewMac('');
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in p-4">
      <div className="bg-light-card dark:bg-slate-800 border border-light-border dark:border-slate-700 rounded-lg shadow-2xl w-full max-w-2xl h-[70vh] flex flex-col">
        <div className="flex justify-between items-center p-4 border-b border-light-border dark:border-slate-700 flex-shrink-0">
          <div className="flex items-center space-x-3">
            <ListChecksIcon className="h-6 w-6 text-primary-400" />
            <h2 className="text-xl font-bold text-light-text-primary dark:text-white">Trusted Device Manager</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-full text-light-text-secondary dark:text-slate-500 hover:bg-light-border dark:hover:bg-slate-700">
            <XIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="p-4 flex-shrink-0 border-b border-light-border dark:border-slate-700">
            <h3 className="text-sm font-semibold mb-2 text-light-text-primary dark:text-slate-300">Add New Trusted Device</h3>
            <div className="flex space-x-2">
                <input
                    type="text"
                    value={newMac}
                    onChange={(e) => setNewMac(e.target.value)}
                    placeholder="Enter MAC Address (e.g., 00:1A:2B:3C:4D:5E)"
                    className="flex-grow bg-light-bg dark:bg-slate-900 border border-light-border dark:border-slate-600 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                />
                <button
                    onClick={handleAddClick}
                    className="px-4 py-2 bg-primary-600 text-white rounded-md font-semibold text-sm hover:bg-primary-700 transition-colors"
                >
                    Add
                </button>
            </div>
        </div>

        <div className="p-4 flex-grow overflow-y-auto">
            <h3 className="text-sm font-semibold mb-3 text-light-text-primary dark:text-slate-300">Current Trusted Devices ({trustedMacs.length})</h3>
            {trustedMacs.length > 0 ? (
                <ul className="space-y-2">
                    {trustedMacs.map(mac => (
                        <li key={mac} className="bg-light-bg dark:bg-slate-900/50 rounded-lg p-3 flex items-center justify-between border border-transparent hover:border-slate-300 dark:hover:border-slate-600 transition-colors">
                            <span className="font-mono text-sm text-light-text-primary dark:text-slate-300">{mac}</span>
                            <button
                                onClick={() => onRemove(mac)}
                                className="p-2 rounded-md hover:bg-red-500/10 text-red-500 transition-colors"
                                title={`Remove ${mac}`}
                            >
                                <Trash2Icon className="h-4 w-4" />
                            </button>
                        </li>
                    ))}
                </ul>
            ) : (
                <div className="text-center text-light-text-secondary dark:text-slate-500 pt-8">
                    <p>No devices have been explicitly trusted.</p>
                    <p className="text-xs mt-1">Add a device's MAC address above to get started.</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default TrustedDevicesManager;
