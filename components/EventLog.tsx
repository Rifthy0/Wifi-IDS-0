import React from 'react';
import { LogEntry, LogLevel } from '../types';
import { AlertTriangleIcon, CheckCircleIcon } from './icons';

interface EventLogProps {
  entries: LogEntry[];
}

const getLogLevelConfig = (level: LogLevel) => {
  switch (level) {
    case LogLevel.Info:
      return {
        icon: <CheckCircleIcon className="h-4 w-4 text-primary-400" />,
        color: 'text-light-text-secondary dark:text-slate-400',
      };
    case LogLevel.Warning:
      return {
        icon: <AlertTriangleIcon className="h-4 w-4 text-yellow-500 dark:text-yellow-400" />,
        color: 'text-yellow-600 dark:text-yellow-400',
      };
    case LogLevel.Alert:
      return {
        icon: <AlertTriangleIcon className="h-4 w-4 text-red-600 dark:text-red-500" />,
        color: 'text-red-600 dark:text-red-400',
      };
    default:
      return {
        icon: null,
        color: 'text-light-text-secondary dark:text-slate-500',
      };
  }
};

const EventLog: React.FC<EventLogProps> = ({ entries }) => {
  return (
      <div className="h-full">
        <ul className="space-y-3">
          {entries.map((entry) => {
            const config = getLogLevelConfig(entry.level);
            return (
              <li key={entry.id} className="flex items-start animate-fade-in">
                <div className="mr-3 flex-shrink-0 mt-1">{config.icon}</div>
                <div className="flex-grow">
                  <p className={`text-sm ${config.color}`}>
                    {entry.message}
                  </p>
                  <p className="text-xs text-light-text-secondary dark:text-slate-600">
                    {new Date(entry.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              </li>
            );
          })}
          {entries.length === 0 && (
             <div className="text-center py-8 text-slate-500">
                 No events to display.
             </div>
          )}
        </ul>
      </div>
  );
};

export default EventLog;