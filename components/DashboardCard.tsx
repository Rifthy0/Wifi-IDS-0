import React from 'react';

const DashboardCard: React.FC<{ title?: string, icon?: React.ReactNode, children: React.ReactNode, className?: string, headerContent?: React.ReactNode }> = ({ title, icon, children, className, headerContent }) => (
    <div className={`bg-light-card dark:bg-slate-800 border border-light-border dark:border-slate-700 rounded-lg shadow-lg ${className}`}>
        {title && (
            <div className="flex items-center justify-between p-4 border-b border-light-border dark:border-slate-700">
                <div className="flex items-center space-x-2">
                    {icon}
                    <h2 className="text-lg font-semibold text-light-text-primary dark:text-white">{title}</h2>
                </div>
                {headerContent}
            </div>
        )}
        <div className="p-4">
            {children}
        </div>
    </div>
);

export default DashboardCard;
