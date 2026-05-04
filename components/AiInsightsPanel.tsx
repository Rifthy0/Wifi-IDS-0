import React from 'react';
import { AiInsight } from '../types';
import DashboardCard from './DashboardCard';
import { BrainCircuitIcon } from './icons';

interface AiInsightsPanelProps {
  insight: AiInsight | null;
}

const AiInsightsPanel: React.FC<AiInsightsPanelProps> = ({ insight }) => {
  return (
    <DashboardCard title="AI/ML Insights" icon={<BrainCircuitIcon className="h-5 w-5 text-primary-400" />}>
      <div className="flex flex-col items-start justify-center h-[150px]">
        {insight ? (
          <div className="animate-fade-in">
            <p className="text-base font-semibold text-primary-400">
              {`Anomaly Detection: ${insight.confidence}% confidence`}
            </p>
            <p className="text-sm text-light-text-secondary dark:text-slate-400 mt-1">
              {`${insight.message} from ${insight.deviceMac}.`}
            </p>
          </div>
        ) : (
          <div className="w-full text-center text-light-text-secondary dark:text-slate-500">
            <BrainCircuitIcon className="h-10 w-10 mx-auto mb-2 opacity-30" />
            <p>Monitoring for behavioral anomalies...</p>
          </div>
        )}
      </div>
    </DashboardCard>
  );
};

export default AiInsightsPanel;