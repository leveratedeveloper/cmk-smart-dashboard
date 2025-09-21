import React, { useState } from "react";
import ReportPageLayout from "./ReportPageLayout";
import MetricCard from "../MetricCard";
import type { Brand, DashboardData, Metric, ReportWidget } from "../../types";
import { MegaphoneIcon } from "../icons";

interface KOLReportProps {
  data: DashboardData;
  brandName: Brand;
}

const allWidgets: ReportWidget[] = [
  {
    id: "kpis",
    name: "KOL Summary KPIs",
    description:
      "High-level indicators for total KOL investment, revenue, and ROI.",
  },
  {
    id: "kolTable",
    name: "KOL Performance Table",
    description:
      "A detailed table of KOLs, sorted by their return on investment.",
  },
];

const KOLReport: React.FC<KOLReportProps> = ({ data, brandName }) => {
  const storageKey = `kolWidgets_${brandName}`;

  const [visibleWidgets, setVisibleWidgets] = useState<string[]>(() => {
    const saved = localStorage.getItem(storageKey);
    return saved ? JSON.parse(saved) : allWidgets.map((w) => w.id);
  });

  const totalCost = data.kols.reduce(
    (sum, kol) => sum + parseFloat(kol.cost.replace(/[^0-9.-]+/g, "")),
    0
  );
  const totalRevenue = data.kols.reduce(
    (sum, kol) =>
      sum + parseFloat(kol.attributedRevenue.replace(/[^0-9.-]+/g, "")),
    0
  );
  const overallROI = totalCost > 0 ? totalRevenue / totalCost : 0;

  const kolMetrics: Metric[] = [
    {
      title: "Total KOL Investment",
      value: `$${totalCost.toLocaleString()}`,
      change: "+5% MoM",
      isPositive: false,
      period: "this quarter",
    },
    {
      title: "Attributed Revenue",
      value: `$${totalRevenue.toLocaleString()}`,
      change: "+25% MoM",
      isPositive: true,
      period: "this quarter",
    },
    {
      title: "Overall KOL ROI",
      value: `${overallROI.toFixed(2)}x`,
      change: "+1.2x",
      isPositive: true,
      period: "vs last quarter",
    },
    {
      title: "Total Engagement",
      value: "7.8M",
      change: "+12%",
      isPositive: true,
      period: "this quarter",
    },
  ];

  return (
    <ReportPageLayout
      title="Key Opinion Leader (KOL) Report"
      description={`Executive summary of influencer marketing for ${brandName}.`}
      allWidgets={allWidgets}
      visibleWidgets={visibleWidgets}
      setVisibleWidgets={setVisibleWidgets}
      storageKey={storageKey}
    >
      <div className="space-y-6">
        {visibleWidgets.includes("kpis") && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {data?.executiveMetrics?.length > 0 ? (
              data.executiveMetrics
                .slice(0, 4)
                .map((metric) => (
                  <MetricCard key={metric.title} metric={metric} />
                ))
            ) : (
              <div className="col-span-4 text-center py-8 text-gray-500">
                No KOL performance metrics available for {brandName}
              </div>
            )}
          </div>
        )}

        {visibleWidgets.includes("kolTable") && (
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center gap-4 mb-4">
              <MegaphoneIcon className="w-8 h-8 text-brand-pink" />
              <h3 className="text-lg font-bold text-gray-800">
                Top KOLs by Return on Investment (ROI)
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-gray-500">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3">
                      KOL Name
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Platform
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Cost
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Attributed Revenue
                    </th>
                    <th scope="col" className="px-6 py-3">
                      ROI
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.kols
                    .sort((a, b) => parseFloat(b.roi) - parseFloat(a.roi))
                    .map((kol) => (
                      <tr
                        key={kol.name}
                        className="bg-white border-b hover:bg-gray-50"
                      >
                        <td className="px-6 py-4 font-medium text-gray-900">
                          {kol.name}
                        </td>
                        <td className="px-6 py-4">{kol.platform}</td>
                        <td className="px-6 py-4">{kol.cost}</td>
                        <td className="px-6 py-4">{kol.attributedRevenue}</td>
                        <td className="px-6 py-4 font-semibold text-green-600">
                          {kol.roi}
                        </td>
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

export default KOLReport;
