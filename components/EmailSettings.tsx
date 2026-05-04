
import React, { useState, useEffect } from 'react';
import { EmailSettings } from '../types';
import DashboardCard from './DashboardCard';
import { SettingsIcon } from './icons';

interface EmailSettingsProps {
    settings: EmailSettings;
    onSave: (settings: EmailSettings) => void;
    onTest: (settings: EmailSettings) => void;
}

const EmailSettingsPanel: React.FC<EmailSettingsProps> = ({ settings, onSave, onTest }) => {
    const [currentSettings, setCurrentSettings] = useState<EmailSettings>(settings);
    
    // FIX: Replaced custom CSS with Tailwind classes for consistency and to fix 'jsx' prop error.
    const inputFieldClasses = "w-full bg-light-bg dark:bg-slate-900 border border-light-border dark:border-slate-600 rounded-md px-3 py-2 text-sm text-light-text-primary dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 shadow-sm";

    useEffect(() => {
        setCurrentSettings(settings);
    }, [settings]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setCurrentSettings(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(currentSettings);
    };
    
    const handleTest = (e: React.FormEvent) => {
        e.preventDefault();
        onTest(currentSettings);
    };

    return (
        <DashboardCard title="Email Alert Integration" icon={<SettingsIcon className="h-5 w-5 text-primary-400" />} className="lg:col-span-3">
            <form className="space-y-4 text-sm">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="recipientEmail" className="block text-xs font-medium text-light-text-secondary dark:text-slate-400 mb-1">
                            Recipient Email
                        </label>
                        <input
                            type="email"
                            name="recipientEmail"
                            id="recipientEmail"
                            value={currentSettings.recipientEmail}
                            onChange={handleChange}
                            placeholder="alerts@example.com"
                            className={inputFieldClasses}
                        />
                    </div>
                    <div>
                        <label htmlFor="smtpServer" className="block text-xs font-medium text-light-text-secondary dark:text-slate-400 mb-1">
                            SMTP Server
                        </label>
                        <input
                            type="text"
                            name="smtpServer"
                            id="smtpServer"
                            value={currentSettings.smtpServer}
                            onChange={handleChange}
                            placeholder="smtp.mailprovider.com"
                            className={inputFieldClasses}
                        />
                    </div>
                    <div>
                        <label htmlFor="smtpPort" className="block text-xs font-medium text-light-text-secondary dark:text-slate-400 mb-1">
                            SMTP Port
                        </label>
                        <input
                            type="text"
                            name="smtpPort"
                            id="smtpPort"
                            value={currentSettings.smtpPort}
                            onChange={handleChange}
                            placeholder="587"
                            className={inputFieldClasses}
                        />
                    </div>
                     <div>
                        <label htmlFor="smtpUser" className="block text-xs font-medium text-light-text-secondary dark:text-slate-400 mb-1">
                            SMTP Username
                        </label>
                        <input
                            type="text"
                            name="smtpUser"
                            id="smtpUser"
                            value={currentSettings.smtpUser}
                            onChange={handleChange}
                            placeholder="your-email@provider.com"
                            className={inputFieldClasses}
                        />
                    </div>
                    <div className="sm:col-span-2">
                        <label htmlFor="smtpPass" className="block text-xs font-medium text-light-text-secondary dark:text-slate-400 mb-1">
                            SMTP Password
                        </label>
                        <input
                            type="password"
                            name="smtpPass"
                            id="smtpPass"
                            value={currentSettings.smtpPass}
                            onChange={handleChange}
                            placeholder="••••••••••••"
                            className={inputFieldClasses}
                        />
                    </div>
                </div>
                <div className="flex justify-end space-x-3 pt-2">
                    <button
                        type="button"
                        onClick={handleTest}
                        className="px-4 py-2 rounded-md font-semibold text-sm bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-light-text-primary dark:text-white transition-colors"
                    >
                        Send Test Email
                    </button>
                    <button
                        type="submit"
                        onClick={handleSave}
                        className="px-4 py-2 bg-primary-600 text-white rounded-md font-semibold text-sm hover:bg-primary-700 transition-colors"
                    >
                        Save Settings
                    </button>
                </div>
            </form>
        </DashboardCard>
    );
};

export default EmailSettingsPanel;