
import React from 'react';

interface MetricCardProps {
  title: string;
  value: string | number;
  isNegative?: boolean;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, isNegative = false }) => {
  const valueColor = isNegative ? 'text-red-600' : 'text-gray-900';
  
  return (
    <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
      <h3 className="text-sm font-medium text-gray-500 truncate">{title}</h3>
      <p className={`mt-1 text-3xl font-semibold ${valueColor}`}>{value}</p>
    </div>
  );
};

export default MetricCard;
