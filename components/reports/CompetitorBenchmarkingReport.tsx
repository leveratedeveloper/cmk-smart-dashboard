import React, { useState } from 'react';
import ReportPageLayout from './ReportPageLayout';
import MetricCard from '../MetricCard';
import type { Brand, DashboardData, ReportWidget } from '../../types';

interface CompetitorBenchmarkingReportProps {
    data: DashboardData;
    brandName: Brand;
}

const allWidgets: ReportWidget[] = [
    { id: 'kpis', name: 'Competitor Benchmarking KPIs', description: 'High-level performance indicators for competitor benchmarking.' },
];

const CompetitorBenchmarkingReport: React.FC<CompetitorBenchmarkingReportProps> = ({ data, brandName }) => {
    const storageKey = `competitorBenchmarkingWidgets_${brandName}`;

    const [visibleWidgets, setVisibleWidgets] = useState<string[]>(() => {
        const saved = localStorage.getItem(storageKey);
        return saved ? JSON.parse(saved) : allWidgets.map(w => w.id);
    });

    return (
        <ReportPageLayout
            title="Competitor Benchmarking Report"
            description={`Analyze your performance against competitors for ${brandName}.`}
            allWidgets={allWidgets}
            visibleWidgets={visibleWidgets}
            setVisibleWidgets={setVisibleWidgets}
            storageKey={storageKey}
        >
            <div className="space-y-6">
                {visibleWidgets.includes('kpis') && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {data.competitorBenchmarkingMetrics.map(metric => <MetricCard key={metric.title} metric={metric} />)}
                    </div>
                )}
            </div>
        </ReportPageLayout>
    );
};

export default CompetitorBenchmarkingReport;