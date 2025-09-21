import React, { useState } from "react";
import {
  BarChart,
  Bar,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from "recharts";
import ReportPageLayout from "./ReportPageLayout";
import MetricCard from "../MetricCard";
import type { Brand, DashboardData, ReportWidget } from "../../types";

interface CompetitorBenchmarkingReportProps {
  data: DashboardData;
  brandName: Brand;
}

const allWidgets: ReportWidget[] = [
  {
    id: "kpis",
    name: "Competitor Metrics",
    description: "Real-time competitor performance metrics from AI analysis.",
  },
  {
    id: "competitionChart",
    name: "Competitive Analysis",
    description:
      "Side-by-side comparison of share of voice and engagement rates.",
  },
  {
    id: "marketInsights",
    name: "Market Insights",
    description: "AI-generated market positioning and competitive threats.",
  },
];

const CompetitorBenchmarkingReport: React.FC<
  CompetitorBenchmarkingReportProps
> = ({ data, brandName }) => {
  const storageKey = `competitorBenchmarkingWidgets_${brandName}`;

  const [visibleWidgets, setVisibleWidgets] = useState<string[]>(() => {
    const saved = localStorage.getItem(storageKey);
    return saved ? JSON.parse(saved) : allWidgets.map((w) => w.id);
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
        {visibleWidgets.includes("kpis") && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {data?.socialMediaCompetitionMetrics?.length > 0 ? (
              data.socialMediaCompetitionMetrics.map((metric) => (
                <MetricCard key={metric.title} metric={metric} />
              ))
            ) : (
              <div className="col-span-4 text-center py-8 text-gray-500">
                No competitor metrics available for {brandName}
              </div>
            )}
          </div>
        )}

        {visibleWidgets.includes("competitionChart") && (
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="text-lg font-bold text-gray-800 mb-4">
              Competitive Landscape Analysis
            </h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                {data?.socialMediaCompetitionChart?.length > 0 ? (
                  <BarChart data={data.socialMediaCompetitionChart}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="competitor" stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="sov" fill="#0ea5e9" name="Share of Voice %" />
                    <Bar
                      dataKey="engagementRate"
                      fill="#34d399"
                      name="Engagement Rate %"
                    />
                    <Bar
                      dataKey="followerGrowth"
                      fill="#f59e0b"
                      name="Follower Growth %"
                    />
                  </BarChart>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    No competitive analysis data available for {brandName}
                  </div>
                )}
              </ResponsiveContainer>
            </div>
            <div className="mt-4 text-sm text-gray-600">
              <p>
                <strong>Real-time analysis powered by AI:</strong> Data includes
                estimated spend, engagement rates, and growth trends from
                competitor social media analysis.
              </p>
            </div>
          </div>
        )}

        {visibleWidgets.includes("marketInsights") && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h3 className="text-lg font-bold text-gray-800 mb-4">
                Market Opportunities
              </h3>
              <div className="space-y-3">
                {data?.recommendations?.length > 0 ? (
                  data.recommendations.slice(0, 3).map((rec, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-3 bg-green-50 rounded-lg"
                    >
                      <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-green-600 text-sm font-bold">
                          +
                        </span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-green-800">
                          {rec.title}
                        </h4>
                        <p className="text-sm text-green-700">
                          {rec.description}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No market opportunities identified for {brandName}
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h3 className="text-lg font-bold text-gray-800 mb-4">
                Competitive Threats & Alerts
              </h3>
              <div className="space-y-3">
                {data?.alerts?.length > 0 ? (
                  data.alerts.slice(0, 3).map((alert, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-3 bg-red-50 rounded-lg"
                    >
                      <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-red-600 text-sm font-bold">
                          !
                        </span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-red-800">
                          {alert.title}
                        </h4>
                        <p className="text-sm text-red-700">
                          {alert.description}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No competitive threats identified for {brandName}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </ReportPageLayout>
  );
};

export default CompetitorBenchmarkingReport;
