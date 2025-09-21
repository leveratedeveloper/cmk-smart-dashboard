import React, { useState } from "react";
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
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

interface PaidMediaReportProps {
  data: DashboardData;
  brandName: Brand;
}

const allWidgets: ReportWidget[] = [
  {
    id: "kpis",
    name: "Paid Media KPIs",
    description: "High-level performance indicators for all paid channels.",
  },
  {
    id: "performanceChart",
    name: "Performance Over Time",
    description: "Chart showing spend, clicks, and conversions over time.",
  },
  {
    id: "spendChart",
    name: "Spend by Platform",
    description: "Pie chart breaking down ad spend by platform.",
  },
  {
    id: "campaignTable",
    name: "Top Performing Campaigns",
    description: "A detailed table of the most successful campaigns.",
  },
];

const PaidMediaReport: React.FC<PaidMediaReportProps> = ({
  data,
  brandName,
}) => {
  const storageKey = `paidMediaWidgets_${brandName}`;

  const [visibleWidgets, setVisibleWidgets] = useState<string[]>(() => {
    const saved = localStorage.getItem(storageKey);
    return saved ? JSON.parse(saved) : allWidgets.map((w) => w.id);
  });

  return (
    <ReportPageLayout
      title="Paid Media Report"
      description={`Analyze the performance of all paid advertising campaigns for ${brandName}.`}
      allWidgets={allWidgets}
      visibleWidgets={visibleWidgets}
      setVisibleWidgets={setVisibleWidgets}
      storageKey={storageKey}
    >
      <div className="space-y-6">
        {visibleWidgets.includes("kpis") && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {data?.executiveMetrics?.length > 0 ? (
              data.executiveMetrics.map((metric) => (
                <MetricCard key={metric.title} metric={metric} />
              ))
            ) : (
              <div className="col-span-4 text-center py-8 text-gray-500">
                No paid media metrics available for {brandName}
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {visibleWidgets.includes("performanceChart") && (
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h3 className="text-lg font-bold text-gray-800 mb-4">
                Monthly Spend Trend
              </h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  {data?.monthlySpendData?.length > 0 ? (
                    <LineChart data={data.monthlySpendData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                      <YAxis />
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
                      <Line
                        type="monotone"
                        dataKey="spend"
                        stroke="#f97316"
                        name="Monthly Spend"
                        strokeWidth={3}
                      />
                    </LineChart>
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-500">
                      No performance data available for {brandName}
                    </div>
                  )}
                </ResponsiveContainer>
              </div>
            </div>
          )}
          {visibleWidgets.includes("spendChart") && (
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h3 className="text-lg font-bold text-gray-800 mb-4">
                Spend by Channel
              </h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  {data?.revenueByChannelData?.length > 0 ? (
                    <PieChart>
                      <Pie
                        data={data.revenueByChannelData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        label
                      >
                        {data.revenueByChannelData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
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
                    </PieChart>
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-500">
                      No channel spend data available for {brandName}
                    </div>
                  )}
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>

        {visibleWidgets.includes("campaignTable") && (
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="text-lg font-bold text-gray-800 mb-4">
              Top Performing Campaigns
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-gray-500">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3">
                      Campaign
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Platform
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Spend
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Revenue
                    </th>
                    <th scope="col" className="px-6 py-3">
                      ROAS
                    </th>
                    <th scope="col" className="px-6 py-3">
                      CPA
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Conversions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data?.topCampaigns?.length > 0 ? (
                    data.topCampaigns.map((c, i) => (
                      <tr
                        key={i}
                        className="bg-white border-b hover:bg-gray-50"
                      >
                        <th
                          scope="row"
                          className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap"
                        >
                          {c.name}
                        </th>
                        <td className="px-6 py-4">{c.platform}</td>
                        <td className="px-6 py-4">{c.spend}</td>
                        <td className="px-6 py-4">{c.revenue}</td>
                        <td className="px-6 py-4 font-semibold text-green-600">
                          {c.roas}
                        </td>
                        <td className="px-6 py-4">{c.cpa}</td>
                        <td className="px-6 py-4">{c.conversions}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-6 py-8 text-center text-gray-500"
                      >
                        No campaign data available for {brandName}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </ReportPageLayout>
  );
};

export default PaidMediaReport;
