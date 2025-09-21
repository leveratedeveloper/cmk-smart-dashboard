import React, { useState } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
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

interface SocialMediaReportProps {
  data: DashboardData;
  brandName: Brand;
}

const allWidgets: ReportWidget[] = [
  {
    id: "kpis",
    name: "Social Media KPIs",
    description: "High-level performance indicators for all social channels.",
  },
  {
    id: "competitionChart",
    name: "Competitor Analysis",
    description: "Chart showing share of voice and engagement vs competitors.",
  },
  {
    id: "contentPerformance",
    name: "Content Performance",
    description: "Metrics on video vs image content performance.",
  },
  {
    id: "campaignObjectives",
    name: "Campaign Objectives",
    description: "Performance breakdown by campaign objective.",
  },
];

const SocialMediaReport: React.FC<SocialMediaReportProps> = ({
  data,
  brandName,
}) => {
  const storageKey = `socialMediaWidgets_${brandName}`;

  const [visibleWidgets, setVisibleWidgets] = useState<string[]>(() => {
    const saved = localStorage.getItem(storageKey);
    return saved ? JSON.parse(saved) : allWidgets.map((w) => w.id);
  });

  return (
    <ReportPageLayout
      title="Social Media Report"
      description={`Track social media performance for ${brandName}.`}
      allWidgets={allWidgets}
      visibleWidgets={visibleWidgets}
      setVisibleWidgets={setVisibleWidgets}
      storageKey={storageKey}
    >
      <div className="space-y-6">
        {visibleWidgets.includes("kpis") && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {data?.socialMediaContentPerformanceMetrics?.length > 0 ? (
              data.socialMediaContentPerformanceMetrics.map((metric) => (
                <MetricCard key={metric.title} metric={metric} />
              ))
            ) : (
              <div className="col-span-4 text-center py-8 text-gray-500">
                No social media metrics available for {brandName}
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {visibleWidgets.includes("competitionChart") && (
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h3 className="text-lg font-bold text-gray-800 mb-4">
                Competitor Analysis
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
                      <Bar
                        dataKey="sov"
                        fill="#0ea5e9"
                        name="Share of Voice %"
                      />
                      <Bar
                        dataKey="engagementRate"
                        fill="#34d399"
                        name="Engagement Rate %"
                      />
                    </BarChart>
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-500">
                      No competitor data available for {brandName}
                    </div>
                  )}
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {visibleWidgets.includes("contentPerformance") && (
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h3 className="text-lg font-bold text-gray-800 mb-4">
                Content Performance Metrics
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {data?.socialMediaContentPerformance?.length > 0 ? (
                  data.socialMediaContentPerformance.map((metric) => (
                    <MetricCard key={metric.title} metric={metric} />
                  ))
                ) : (
                  <div className="col-span-2 text-center py-8 text-gray-500">
                    No content performance data available for {brandName}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {visibleWidgets.includes("campaignObjectives") && (
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="text-lg font-bold text-gray-800 mb-4">
              Campaign Performance by Objective
            </h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                {data?.campaignObjectiveData?.length > 0 ? (
                  <BarChart data={data.campaignObjectiveData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="objective"
                      stroke="#9ca3af"
                      tick={{ fontSize: 10, fill: "#374151", dy: 10 }}
                    />
                    <YAxis stroke="#9ca3af" />
                    <Tooltip
                      formatter={(value: number) =>
                        new Intl.NumberFormat("id-ID", {
                          style: "currency",
                          currency: "IDR",
                          minimumFractionDigits: 0,
                        }).format(value)
                      }
                    />
                    <Legend />
                    <Bar dataKey="spend" fill="#3b82f6" name="Total Spend" />
                  </BarChart>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    No campaign objective data available for {brandName}
                  </div>
                )}
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </ReportPageLayout>
  );
};

export default SocialMediaReport;
