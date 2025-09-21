import React, { useState } from "react";
import {
  AreaChart,
  Area,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import ReportPageLayout from "./ReportPageLayout";
import MetricCard from "../MetricCard";
import type { Brand, DashboardData, ReportWidget } from "../../types";

interface OrganicSearchReportProps {
  data: DashboardData;
  brandName: Brand;
}

const allWidgets: ReportWidget[] = [
  {
    id: "kpis",
    name: "Organic Search KPIs",
    description: "High-level performance indicators for organic search.",
  },
  {
    id: "trafficTrendChart",
    name: "Organic Traffic Trend",
    description: "Chart showing organic sessions over the last 30 days.",
  },
  {
    id: "topKeywordsTable",
    name: "Top Keywords",
    description: "Table of top-performing keywords by clicks.",
  },
  {
    id: "topPagesTable",
    name: "Top Landing Pages",
    description: "Table of top organic landing pages by sessions.",
  },
];

const OrganicSearchReport: React.FC<OrganicSearchReportProps> = ({
  data,
  brandName,
}) => {
  const storageKey = `organicSearchWidgets_${brandName}`;

  const [visibleWidgets, setVisibleWidgets] = useState<string[]>(() => {
    const saved = localStorage.getItem(storageKey);
    return saved ? JSON.parse(saved) : allWidgets.map((w) => w.id);
  });

  return (
    <ReportPageLayout
      title="Organic Search Report"
      description={`Analyze SEO performance and traffic for ${brandName}.`}
      allWidgets={allWidgets}
      visibleWidgets={visibleWidgets}
      setVisibleWidgets={setVisibleWidgets}
      storageKey={storageKey}
    >
      <div className="space-y-6">
        {visibleWidgets.includes("kpis") && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {data?.organicSearchTabMetrics?.length > 0 ? (
              data.organicSearchTabMetrics.map((metric) => (
                <MetricCard key={metric.title} metric={metric} />
              ))
            ) : (
              <div className="col-span-4 text-center py-8 text-gray-500">
                No organic search metrics available for {brandName}
              </div>
            )}
          </div>
        )}

        {visibleWidgets.includes("trafficTrendChart") && (
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="text-lg font-bold text-gray-800 mb-4">
              Organic Traffic Trend (Last 30 Days)
            </h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.organicTrafficData}>
                  <defs>
                    <linearGradient
                      id="colorOrganic"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="sessions"
                    stroke="#3b82f6"
                    fillOpacity={1}
                    fill="url(#colorOrganic)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {visibleWidgets.includes("topKeywordsTable") && (
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="text-lg font-bold text-gray-800 mb-4">
              Top Keywords by Clicks
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-gray-500">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                  <tr>
                    <th className="px-6 py-3">Keyword</th>
                    <th className="px-6 py-3">Position</th>
                    <th className="px-6 py-3">Monthly Searches</th>
                    <th className="px-6 py-3">Clicks</th>
                  </tr>
                </thead>
                <tbody>
                  {data.topKeywords.map((k) => (
                    <tr
                      key={k.keyword}
                      className="bg-white border-b hover:bg-gray-50"
                    >
                      <td className="px-6 py-4 font-medium text-gray-900">
                        {k.keyword}
                      </td>
                      <td className="px-6 py-4">{k.position}</td>
                      <td className="px-6 py-4">{k.monthlySearches}</td>
                      <td className="px-6 py-4">{k.clicks}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {visibleWidgets.includes("topPagesTable") && (
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="text-lg font-bold text-gray-800 mb-4">
              Top Landing Pages (Organic)
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-gray-500">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3">
                      Page
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Sessions
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Bounce Rate
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Avg. Time
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Conversions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.topPages.map((p, i) => (
                    <tr key={i} className="bg-white border-b hover:bg-gray-50">
                      <th
                        scope="row"
                        className="px-6 py-4 font-medium text-blue-600 hover:underline cursor-pointer whitespace-nowrap"
                      >
                        {p.path}
                      </th>
                      <td className="px-6 py-4">{p.sessions}</td>
                      <td className="px-6 py-4">{p.bounceRate}</td>
                      <td className="px-6 py-4">{p.avgTime}</td>
                      <td className="px-6 py-4">{p.conversions}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </ReportPageLayout>
  );
};

export default OrganicSearchReport;
