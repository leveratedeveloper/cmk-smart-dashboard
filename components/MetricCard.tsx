
import React from 'react';
import { ArrowUpIcon, ArrowDownIcon, InformationCircleIcon } from './icons';
import type { Metric } from '../types';

interface MetricCardProps {
  metric: Metric;
}

const MetricCard: React.FC<MetricCardProps> = ({ metric }) => {
    const { title, value, change, isPositive, period } = metric;
    
    const changeColor = isPositive ? 'text-brand-green' : 'text-brand-red';
    const changeBg = isPositive ? 'bg-green-100' : 'bg-red-100';
    const ChangeIcon = isPositive ? ArrowUpIcon : ArrowDownIcon;

    return (
        <div className="border bg-white p-5 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500 font-medium">{title}</p>
                <div className="relative group">
                    <InformationCircleIcon className="w-5 h-5 text-gray-400 cursor-help" />
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-xs px-3 py-2 bg-gray-900 text-white text-xs font-normal rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                        Lorem Ipsum
                        <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-gray-900"></div>
                    </div>
                </div>
            </div>

            <p className="text-xl font-bold text-gray-800 mt-2">{value}</p>
            <div className="flex items-center mt-2">
                <div className={`flex items-center gap-1 ${changeBg} ${changeColor} rounded-full px-2 py-0.5`}>
                    <ChangeIcon className="w-3 h-3" />
                    <span className="text-xs font-semibold">{change}</span>
                </div>
                <p className="text-xs text-gray-500 ml-2">{period}</p>
            </div>
        </div>
    );
};

export default MetricCard;
