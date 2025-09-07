import React, { useState } from 'react';
import ReportPageLayout from './ReportPageLayout';
import MetricCard from '../MetricCard';
import type { Brand, DashboardData, ReportWidget } from '../../types';

interface SocialListeningReportProps {
    data: DashboardData;
    brandName: Brand;
}

const allWidgets: ReportWidget[] = [
    { id: 'kpis', name: 'Social Listening KPIs', description: 'High-level performance indicators for social listening.' },
];

const SocialListeningReport: React.FC<SocialListeningReportProps> = ({ data, brandName }) => {
    const storageKey = `socialListeningWidgets_${brandName}`;

    const [visibleWidgets, setVisibleWidgets] = useState<string[]>(() => {
        const saved = localStorage.getItem(storageKey);
        return saved ? JSON.parse(saved) : allWidgets.map(w => w.id);
    });

    return (
        <ReportPageLayout
            title="Social Listening Report"
            description={`Monitor social media conversations and trends for ${brandName}.`}
            allWidgets={allWidgets}
            visibleWidgets={visibleWidgets}
            setVisibleWidgets={setVisibleWidgets}
            storageKey={storageKey}
        >
            <div className="space-y-6">
                {visibleWidgets.includes('kpis') && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {data.socialListeningMetrics.map(metric => <MetricCard key={metric.title} metric={metric} />)}
                    </div>
                )}
            </div>
        </ReportPageLayout>
    );
};

export default SocialListeningReport;