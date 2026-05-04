import React from 'react';
import { WifiIcon, GhostIcon, SunIcon, MoonIcon, MailIcon, ListChecksIcon, LogOutIcon } from './icons';

interface HeaderProps {
  stealthMode: boolean;
  theme: string;
  toggleTheme: () => void;
  alertCount: number;
  onOpenInbox: () => void;
  onOpenTrustedManager: () => void;
  onLogout: () => void;
  isSimulationMode: boolean;
  setIsSimulationMode: (mode: boolean) => void;
}

const Header: React.FC<HeaderProps> = ({ 
  stealthMode, theme, toggleTheme, alertCount, 
  onOpenInbox, onOpenTrustedManager, onLogout,
  isSimulationMode, setIsSimulationMode
}) => {
  return (
    <header className="bg-light-card/80 dark:bg-slate-900/70 backdrop-blur-sm border-b border-light-border dark:border-slate-700 sticky top-0 z-10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <WifiIcon className="h-8 w-8 text-primary-500" />
            <div className="ml-3">
              <h1 className="text-xl font-bold text-light-text-primary dark:text-white leading-tight">
                Smart Wi-Fi IDS
              </h1>
              <div className="flex items-center space-x-2">
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${isSimulationMode ? 'bg-amber-500/20 text-amber-500' : 'bg-emerald-500/20 text-emerald-500'}`}>
                  {isSimulationMode ? 'SIMULATION' : 'REAL-TIME'}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {/* Mode Switcher */}
            <div className="hidden md:flex items-center bg-light-bg dark:bg-slate-800 rounded-lg p-1 border border-light-border dark:border-slate-700">
              <button
                onClick={() => setIsSimulationMode(true)}
                className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${isSimulationMode ? 'bg-primary-600 text-white shadow-sm' : 'text-light-text-secondary dark:text-slate-400 hover:text-primary-400'}`}
              >
                SIMULATION
              </button>
              <button
                onClick={() => setIsSimulationMode(false)}
                className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${!isSimulationMode ? 'bg-primary-600 text-white shadow-sm' : 'text-light-text-secondary dark:text-slate-400 hover:text-primary-400'}`}
              >
                REAL
              </button>
            </div>

            {stealthMode && (
              <div className="flex items-center space-x-2 text-sm font-medium text-primary-400 animate-fade-in" title="Stealth mode is active, reducing scan aggressiveness.">
                <GhostIcon className="h-5 w-5" />
                <span>STEALTH</span>
              </div>
            )}
            <div className="flex items-center space-x-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
              </span>
              <span className="text-sm font-medium text-green-400">LIVE</span>
            </div>
            <button
              onClick={onOpenInbox}
              className="relative p-2 rounded-full text-light-text-secondary dark:text-slate-400 hover:bg-light-border dark:hover:bg-slate-700 transition-colors"
              title="Open Inbox"
            >
              <MailIcon className="h-5 w-5" />
              {alertCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5">
                  <span className="relative inline-flex items-center justify-center rounded-full h-5 w-5 bg-red-500 text-white text-xs font-bold">
                    {alertCount}
                  </span>
                </span>
              )}
            </button>
            <button
              onClick={onOpenTrustedManager}
              className="p-2 rounded-full text-light-text-secondary dark:text-slate-400 hover:bg-light-border dark:hover:bg-slate-700 transition-colors"
              title="Manage Trusted Devices"
            >
              <ListChecksIcon className="h-5 w-5" />
            </button>
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full text-light-text-secondary dark:text-slate-400 hover:bg-light-border dark:hover:bg-slate-700 transition-colors"
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {theme === 'dark' ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
            </button>
            <button
              onClick={onLogout}
              className="p-2 rounded-full text-light-text-secondary dark:text-slate-400 hover:bg-light-border dark:hover:bg-slate-700 transition-colors"
              title="Logout"
            >
              <LogOutIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;