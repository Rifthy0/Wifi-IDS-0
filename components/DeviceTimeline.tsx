
import React from 'react';
import { StatusHistoryEntry, DeviceStatus } from '../types';
import { ShieldAlertIcon, CheckCircleIcon, ShieldOffIcon, AlertTriangleIcon } from './icons';

interface DeviceTimelineProps {
  history: StatusHistoryEntry[];
}

const getStatusIcon = (status: DeviceStatus | 'Blocked') => {
  switch (status) {
    case DeviceStatus.Trusted:
      return <CheckCircleIcon className="h-4 w-4 text-green-500" />;
    case DeviceStatus.Suspicious:
      return <AlertTriangleIcon className="h-4 w-4 text-yellow-500" />;
    case 'Blocked':
      return <ShieldOffIcon className="h-4 w-4 text-red-500" />;
    default:
      return <ShieldAlertIcon className="h-4 w-4 text-slate-500" />;
  }
};

const DeviceTimeline: React.FC<DeviceTimelineProps> = ({ history }) => {
  // Filter only entries that have an actual event description
  const eventHistory = history.filter(h => !!h.event).reverse();

  if (eventHistory.length === 0) {
    return (
      <div className="text-center py-8 text-slate-500 text-xs italic">
        No significant events recorded for this device.
      </div>
    );
  }

  return (
    <div className="relative pl-4 border-l-2 border-slate-200 dark:border-slate-700 space-y-6 ml-2 mt-4">
      {eventHistory.map((entry, index) => (
        <div key={`${entry.timestamp}-${index}`} className="relative">
          <div className="absolute -left-[25px] mt-1.5 p-1 rounded-full bg-light-card dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700">
            {getStatusIcon(entry.status)}
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-slate-500 uppercase">
              {new Date(entry.timestamp).toLocaleString()}
            </span>
            <span className="text-sm font-semibold text-light-text-primary dark:text-white mt-1">
              {entry.event}
            </span>
            <div className="flex items-center space-x-2 mt-1">
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold uppercase
                ${entry.status === DeviceStatus.Trusted ? 'bg-green-500/10 text-green-500' : 
                  entry.status === DeviceStatus.Suspicious ? 'bg-yellow-500/10 text-yellow-500' : 
                  entry.status === 'Blocked' ? 'bg-red-500/10 text-red-500' : 'bg-slate-500/10 text-slate-500'}
              `}>
                {entry.status}
              </span>
              <span className="text-[10px] text-slate-500">
                Threat Score: {entry.threatScore}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DeviceTimeline;
