import React, { useState } from "react";
import ReportPageLayout from "./ReportPageLayout";
import MetricCard from "../MetricCard";
import type { Brand, DashboardData, ReportWidget } from "../../types";

interface SocialListeningReportProps {
  data: DashboardData;
  brandName: Brand;
}

const allWidgets: ReportWidget[] = [
  {
    id: "kpis",
    name: "Social Listening KPIs",
    description: "High-level performance indicators for social listening.",
  },
  {
    id: "hashtags",
    name: "Trending Hashtags",
    description: "Most popular hashtags related to your brand and industry.",
  },
  {
    id: "recommendations",
    name: "AI Insights",
    description: "AI-generated recommendations based on campaign performance.",
  },
];

const SocialListeningReport: React.FC<SocialListeningReportProps> = ({
  data,
  brandName,
}) => {
  const storageKey = `socialListeningWidgets_${brandName}`;

  const [visibleWidgets, setVisibleWidgets] = useState<string[]>(() => {
    const saved = localStorage.getItem(storageKey);
    return saved ? JSON.parse(saved) : allWidgets.map((w) => w.id);
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
        {visibleWidgets.includes("kpis") && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {data?.socialListeningMetrics?.length > 0 ? (
              data.socialListeningMetrics.map((metric) => (
                <MetricCard key={metric.title} metric={metric} />
              ))
            ) : (
              <div className="col-span-4 text-center py-8 text-gray-500">
                No social listening metrics available for {brandName}
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {visibleWidgets.includes("hashtags") && (
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h3 className="text-lg font-bold text-gray-800 mb-4">
                Trending Hashtags
              </h3>
              <div className="space-y-3">
                {data?.trendingHashtags?.length > 0 ? (
                  data.trendingHashtags.map((hashtag, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <span className="text-blue-600 font-medium">
                        {hashtag.hashtag}
                      </span>
                      <span className="text-gray-600 text-sm">
                        {hashtag.mentions.toLocaleString()} mentions
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No trending hashtags available for {brandName}
                  </div>
                )}
              </div>
            </div>
          )}

          {visibleWidgets.includes("recommendations") && (
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h3 className="text-lg font-bold text-gray-800 mb-4">
                AI-Generated Insights
              </h3>
              <div className="space-y-3">
                {data?.recommendations?.length > 0 ? (
                  data.recommendations.slice(0, 4).map((rec, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg"
                    >
                      <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-blue-600 text-sm font-bold">
                          💡
                        </span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-blue-800">
                          {rec.title}
                        </h4>
                        <p className="text-sm text-blue-700">
                          {rec.description}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No AI insights available for {brandName}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </ReportPageLayout>
  );
};

export default SocialListeningReport;
