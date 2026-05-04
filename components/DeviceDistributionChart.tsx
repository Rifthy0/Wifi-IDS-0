import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface DeviceDistributionChartProps {
  data: {
    trusted: number;
    suspicious: number;
    unknown: number;
    blocked: number;
  };
  theme: string;
}

const DeviceDistributionChart: React.FC<DeviceDistributionChartProps> = ({ data, theme }) => {
  const chartData = [
    { name: 'Trusted', value: data.trusted },
    { name: 'Suspicious', value: data.suspicious },
    { name: 'Unknown', value: data.unknown },
    { name: 'Blocked', value: data.blocked },
  ].filter(item => item.value > 0);

  const COLORS: { [key: string]: string } = {
    'Trusted': '#4ade80',    // green-400
    'Suspicious': '#facc15', // yellow-400
    'Unknown': '#64748b',   // slate-500
    'Blocked': '#ef4444'     // red-500
  };

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-center text-light-text-secondary dark:text-slate-500">
        <div>
          <p>No device data to display.</p>
          <p className="text-xs">Start scanning to see device distribution.</p>
        </div>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Tooltip
          contentStyle={theme === 'dark'
            ? { backgroundColor: '#1e293b', border: '1px solid #334155', color: '#cbd5e1', borderRadius: '0.5rem' }
            : { backgroundColor: '#FFFFFF', border: '1px solid #e2e8f0', color: '#1e293b', borderRadius: '0.5rem' }
          }
          cursor={{ fill: 'transparent' }}
        />
        <Legend 
          iconType="circle" 
          layout="vertical" 
          verticalAlign="middle" 
          align="right"
          wrapperStyle={{ fontSize: "14px", color: theme === 'dark' ? '#cbd5e1' : '#1e293b' }}
        />
        <Pie
          data={chartData}
          cx="35%"
          cy="50%"
          innerRadius={45}
          outerRadius={70}
          fill="#8884d8"
          paddingAngle={5}
          dataKey="value"
          nameKey="name"
        >
          {chartData.map((entry) => (
            <Cell key={`cell-${entry.name}`} fill={COLORS[entry.name]} stroke={theme === 'dark' ? '#1e293b' : '#ffffff'} />
          ))}
        </Pie>
      </PieChart>
    </ResponsiveContainer>
  );
};

export default DeviceDistributionChart;
