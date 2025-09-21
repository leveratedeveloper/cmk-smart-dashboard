import React, { useState } from "react";
import {
  BarChart,
  Bar,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";
import ReportPageLayout from "./ReportPageLayout";
import MetricCard from "../MetricCard";
import type { Brand, DashboardData, ReportWidget } from "../../types";

interface EcommerceReportProps {
  data: DashboardData;
  brandName: Brand;
}

const allWidgets: ReportWidget[] = [
  {
    id: "kpis",
    name: "E-Commerce KPIs",
    description: "Lead generation and conversion metrics from campaigns.",
  },
  {
    id: "productChart",
    name: "Product Performance",
    description: "Chart showing lead generation by product category.",
  },
  {
    id: "funnelChart",
    name: "Marketing Funnel Performance",
    description: "Performance across different marketing funnel stages.",
  },
];

const EcommerceReport: React.FC<EcommerceReportProps> = ({
  data,
  brandName,
}) => {
  const storageKey = `ecommerceWidgets_${brandName}`;

  const [visibleWidgets, setVisibleWidgets] = useState<string[]>(() => {
    const saved = localStorage.getItem(storageKey);
    return saved ? JSON.parse(saved) : allWidgets.map((w) => w.id);
  });

  return (
    <ReportPageLayout
      title="E-commerce Report"
      description={`Monitor lead generation and conversion performance for ${brandName}.`}
      allWidgets={allWidgets}
      visibleWidgets={visibleWidgets}
      setVisibleWidgets={setVisibleWidgets}
      storageKey={storageKey}
    >
      <div className="space-y-6">
        {visibleWidgets.includes("kpis") && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {data?.secondaryMetrics?.length > 0 ? (
              data.secondaryMetrics.map((metric) => (
                <MetricCard key={metric.title} metric={metric} />
              ))
            ) : (
              <div className="col-span-4 text-center py-8 text-gray-500">
                No e-commerce metrics available for {brandName}
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {visibleWidgets.includes("productChart") && (
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h3 className="text-lg font-bold text-gray-800 mb-4">
                Lead Generation by Product
              </h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  {data?.productPerformanceData?.length > 0 ? (
                    <BarChart data={data.productPerformanceData}>
                      <XAxis
                        dataKey="product"
                        tick={{ fontSize: 10, fill: "#374151", dy: 10 }}
                      />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar
                        dataKey="leads"
                        fill="#10b981"
                        name="Leads Generated"
                      />
                    </BarChart>
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-500">
                      No product performance data available for {brandName}
                    </div>
                  )}
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {visibleWidgets.includes("funnelChart") && (
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h3 className="text-lg font-bold text-gray-800 mb-4">
                Marketing Funnel Performance
              </h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  {data?.funnelPerformanceData?.length > 0 ? (
                    <BarChart data={data.funnelPerformanceData}>
                      <XAxis dataKey="funnel" stroke="#9ca3af" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar
                        dataKey="campaigns"
                        fill="#8b5cf6"
                        name="Active Campaigns"
                      />
                      <Bar
                        dataKey="avgSpend"
                        fill="#ec4899"
                        name="Avg Spend (IDR)"
                      />
                    </BarChart>
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-500">
                      No funnel performance data available for {brandName}
                    </div>
                  )}
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      </div>
    </ReportPageLayout>
  );
};

export default EcommerceReport;
