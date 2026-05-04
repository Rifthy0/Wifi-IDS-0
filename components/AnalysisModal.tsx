
import React from 'react';
import { Device } from '../types';
import { XIcon, CpuIcon } from './icons';

interface AnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  device: Device;
  analysisResult: string;
  isLoading: boolean;
}

const AnalysisModal: React.FC<AnalysisModalProps> = ({ isOpen, onClose, device, analysisResult, isLoading }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-light-card dark:bg-slate-800 border border-light-border dark:border-slate-700 rounded-lg shadow-2xl w-full max-w-2xl mx-4 transform transition-all duration-300">
        <div className="flex justify-between items-center p-4 border-b border-light-border dark:border-slate-700">
          <div className="flex items-center space-x-3">
            <CpuIcon className="h-6 w-6 text-primary-400" />
            <h2 className="text-xl font-bold text-light-text-primary dark:text-white">AI Threat Analysis</h2>
          </div>
          <button onClick={onClose} className="text-light-text-secondary dark:text-slate-500 hover:text-light-text-primary dark:hover:text-white">
            <XIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6">
          <div className="bg-light-bg dark:bg-slate-900 p-4 rounded-md mb-4 text-sm border border-light-border dark:border-slate-700">
            <h3 className="font-semibold text-light-text-primary dark:text-slate-300 mb-2">Device Snapshot:</h3>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 font-mono text-light-text-secondary dark:text-slate-400">
                <p><span className="text-light-text-primary dark:text-white">MAC:</span> {device.mac}</p>
                <p><span className="text-light-text-primary dark:text-white">IP:</span> {device.ip}</p>
                <p><span className="text-light-text-primary dark:text-white">Vendor:</span> {device.vendor}</p>
                <p><span className="text-light-text-primary dark:text-white">Location:</span> {device.location}</p>
                <p><span className="text-light-text-primary dark:text-white">RSSI:</span> {device.rssi} dBm</p>
                <p><span className="text-light-text-primary dark:text-white">Threat Score:</span> {device.threatScore}</p>
                <p><span className="text-light-text-primary dark:text-white">Data Sent:</span> {(device.behavior.dataTransmitted / 1024).toFixed(2)} MB</p>
                {device.behaviorProfile.established && (
                    <p><span className="text-light-text-primary dark:text-white">Typical Hour:</span> ~{Math.round(device.behaviorProfile.avgConnectionHour!)}:00 UTC</p>
                )}
            </div>
            <p className="mt-3 text-yellow-600 dark:text-yellow-400">
              <span className="font-semibold text-yellow-700 dark:text-yellow-300">Suspicion Reason:</span> {device.suspicionReason}
            </p>
          </div>

          <div className="prose prose-sm max-w-none text-light-text-primary dark:text-slate-300 h-64 overflow-y-auto pr-2">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
                <p className="mt-4 text-light-text-secondary dark:text-slate-500">Analyzing with Gemini AI...</p>
              </div>
            ) : (
                <pre className="whitespace-pre-wrap font-sans bg-transparent p-0">{analysisResult}</pre>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalysisModal;