import React from 'react';
import { ThreatLevel } from '../types';

interface ThreatIndicatorProps {
  level: ThreatLevel;
}

const ThreatIndicator: React.FC<ThreatIndicatorProps> = ({ level }) => {
  const levelConfig = {
    [ThreatLevel.Low]: {
      label: 'Low',
      angle: -70,
      color: 'text-green-400',
      message: 'Network is secure. No threats detected.',
    },
    [ThreatLevel.Medium]: {
      label: 'Medium',
      angle: -25,
      color: 'text-yellow-400',
      message: 'Minor anomalies detected. Monitoring advised.',
    },
    [ThreatLevel.High]: {
      label: 'High',
      angle: 25,
      color: 'text-orange-400',
      message: 'Suspicious activity found. Investigate immediately.',
    },
    [ThreatLevel.Critical]: {
      label: 'Critical',
      angle: 70,
      color: 'text-red-500',
      message: 'Active threat detected! System may be compromised.',
    },
  };

  const config = levelConfig[level];

  return (
    <div className="flex flex-col items-center justify-between h-full text-center">
        <h2 className="text-lg font-semibold text-light-text-primary dark:text-white">Threat Level</h2>
        <div className="relative w-full max-w-[200px] aspect-[2/1] my-2">
            <svg viewBox="0 0 100 50" className="w-full h-full">
                <defs>
                    <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#4ade80" /> 
                        <stop offset="33%" stopColor="#facc15" />
                        <stop offset="66%" stopColor="#fb923c" />
                        <stop offset="100%" stopColor="#ef4444" />
                    </linearGradient>
                </defs>
                {/* Background Arc */}
                <path
                    d="M 10 50 A 40 40 0 0 1 90 50"
                    className="stroke-slate-200 dark:stroke-slate-700"
                    strokeWidth="8"
                    fill="none"
                    strokeLinecap="round"
                />
                {/* Foreground/Gradient Arc */}
                 <path
                    d="M 10 50 A 40 40 0 0 1 90 50"
                    stroke="url(#gaugeGradient)"
                    strokeWidth="8"
                    fill="none"
                    strokeLinecap="round"
                />
                {/* Needle */}
                <g transform={`rotate(${config.angle} 50 50)`} style={{ transition: 'transform 0.7s cubic-bezier(0.68, -0.55, 0.27, 1.55)' }}>
                    <path d="M 50 50 L 50 15" className="stroke-slate-800 dark:stroke-slate-200" strokeWidth="2" />
                    <circle cx="50" cy="50" r="3.5" className="fill-slate-800 dark:fill-slate-200" />
                </g>
            </svg>
        </div>
         <div className="text-center mt-[-0.5rem] z-10">
              <p className={`text-3xl font-bold ${config.color} transition-colors`}>{config.label}</p>
              <p className="text-xs text-light-text-secondary dark:text-slate-500 h-8 px-2">{config.message}</p>
         </div>
    </div>
  );
};

export default ThreatIndicator;
