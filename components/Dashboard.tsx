import React, { useState, useRef, useEffect } from "react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";
import {
  SendIcon,
  CalendarIcon,
  DownloadIcon,
  RefreshCwIcon,
  MoreHorizontalIcon,
  ChevronDownIcon,
} from "./icons";
import MetricCard from "./MetricCard";
import AlertCard from "./AlertCard";
import RecommendationCard from "./RecommendationCard";
import type { Brand, DashboardData, ConversationItem } from "../types";
import { LoaderIcon } from "./icons";

interface DashboardProps {
  selectedBrand: Brand;
  onAiPrompt: (prompt: string, brand: Brand) => void;
  isAiLoading: boolean;
  aiConversation: ConversationItem[];
  data?: DashboardData; // Optional to handle loading states
  isDataLoading?: boolean;
  onRefreshData?: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({
  selectedBrand,
  onAiPrompt,
  isAiLoading,
  aiConversation,
  data,
  isDataLoading = false,
  onRefreshData,
}) => {
  const [prompt, setPrompt] = useState("");
  const [selectedDateRange, setSelectedDateRange] = useState("Last 30 Days");
  const [isDateDropdownOpen, setDateDropdownOpen] = useState(false);
  const dateDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dateDropdownRef.current &&
        !dateDropdownRef.current.contains(event.target as Node)
      ) {
        setDateDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const suggestedPrompts = [
    "Show me the most effective channel for Engagement",
    "Which CPL is the cheapest?",
    "Show me the most engaged demographic",
  ];

  // Note: brandData will be passed via props from parent component

  const handlePromptSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isAiLoading) return;
    onAiPrompt(prompt, selectedBrand);
  };

  const OverviewContent = ({ data, isLoading }: { data?: DashboardData; isLoading?: boolean }) => {
    // Show loading spinner when data is loading
    if (isLoading || !data) {
      return (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center justify-center h-64">
              <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
            </div>
          </div>
        </div>
      );
    }

    const dateRanges = [
      "Last 7 Days",
      "Last 30 Days",
      "Last 90 Days",
      "This Month",
      "Last Month",
      "This Year",
    ];

    const renderCustomizedLegend = (props: any) => {
      const { payload } = props;
      if (!payload) return null;

      return (
        <ul className="list-none p-0 m-0 flex flex-col gap-3 justify-center h-full">
          {payload.map((entry: any, index: number) => (
            <li key={`item-${index}`} className="flex items-center">
              <span
                className="w-3 h-3 rounded-full mr-3"
                style={{ backgroundColor: entry.color }}
              ></span>
              <span className="text-gray-600 text-sm">
                {entry.payload?.name}:{" "}
              </span>
              <span className="text-gray-800 font-semibold text-sm ml-1">
                {entry.payload?.revenue}
              </span>
            </li>
          ))}
        </ul>
      );
    };

    if (isLoading) {
      return (
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-100 p-8 rounded-xl shadow-sm border border-blue-200">
            <div className="flex flex-col items-center justify-center h-64 space-y-4">
              <div className="relative">
                <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                <div className="absolute inset-2 w-8 h-8 border-4 border-transparent border-t-blue-400 rounded-full animate-spin animation-delay-150"></div>
              </div>
              <div className="text-center">
                <h3 className="text-xl font-semibold text-blue-800 mb-2">
                  Loading {selectedBrand} Data
                </h3>
                <p className="text-blue-600 text-sm">
                  Fetching real-time campaign metrics from Supabase...
                </p>
                <div className="mt-4 flex items-center justify-center space-x-1">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce animation-delay-100"></div>
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce animation-delay-200"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div
          className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm"
          title="A high-level overview of the most important marketing metrics."
        >
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-800">
                Executive Summary
              </h2>
              <p className="text-sm text-gray-500">
                Comprehensive view for {selectedBrand}
              </p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative" ref={dateDropdownRef}>
                <button
                  onClick={() => setDateDropdownOpen(!isDateDropdownOpen)}
                  className="flex items-center gap-2 px-3 py-2 border rounded-md text-sm font-medium bg-white hover:bg-gray-50"
                >
                  <CalendarIcon className="w-4 h-4 text-gray-500" />
                  <span>{selectedDateRange}</span>
                  <ChevronDownIcon
                    className={`w-4 h-4 text-gray-500 transition-transform ${
                      isDateDropdownOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {isDateDropdownOpen && (
                  <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-20">
                    {dateRanges.map((range) => (
                      <button
                        key={range}
                        onClick={() => {
                          setSelectedDateRange(range);
                          setDateDropdownOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2 text-sm font-medium ${
                          selectedDateRange === range
                            ? "bg-blue-50 text-brand-pink"
                            : "text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        {range}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button className="p-2 border rounded-md bg-white hover:bg-gray-50">
                <DownloadIcon className="w-5 h-5 text-gray-600" />
              </button>
              <button 
                onClick={onRefreshData}
                disabled={isDataLoading}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed"
              >
                <RefreshCwIcon className={`w-4 h-4 ${isDataLoading ? 'animate-spin' : ''}`} />
                <span>{isDataLoading ? 'Refreshing...' : 'Refresh Data'}</span>
              </button>
            </div>
          </div>
          <div title="AI-powered notifications.">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-800">
                Alerts & Insights
              </h3>
              <a
                href="#"
                className="text-sm font-semibold text-blue-600 hover:underline"
              >
                View All
              </a>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.alerts?.map((alert) => (
                <AlertCard key={alert.id} alert={alert} />
              )) || (
                <div className="col-span-2 text-center text-gray-500 py-4">
                  No alerts available
                </div>
              )}
            </div>
          </div>
          <div title="AI-generated recommendations and next steps." className="mt-8">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-800">
                Recommendations & Next Steps
              </h3>
              <a
                href="#"
                className="text-sm font-semibold text-blue-600 hover:underline"
              >
                View All
              </a>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.recommendations?.map((recommendation, index) => (
                <RecommendationCard
                  key={index}
                  recommendation={recommendation}
                />
              )) || (
                <div className="col-span-2 text-center text-gray-500 py-4">
                  No recommendations available
                </div>
              )}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
            {data.executiveMetrics?.map((metric) => (
              <MetricCard key={metric.title} metric={metric} />
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
            {data.secondaryMetrics?.map((metric) => (
              <MetricCard key={metric.title} metric={metric} />
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div
            className="lg:col-span-2 bg-white border border-gray-200 p-6 rounded-xl shadow-sm"
            title="A breakdown of total revenue generated by each marketing channel."
          >
            <div className="flex items-start justify-between">
              <h3 className="text-lg font-bold text-gray-800">Web Lead</h3>
              <button className="text-gray-400 hover:text-gray-600">
                <MoreHorizontalIcon />
              </button>
            </div>
            <div className="h-64 mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.revenueByChannelData || []}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    fill="#8884d8"
                    paddingAngle={5}
                  >
                    {(data.revenueByChannelData || []).map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.color}
                        stroke={entry.color}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) =>
                      new Intl.NumberFormat("en-US", {
                        style: "currency",
                        currency: "USD",
                        minimumFractionDigits: 0,
                      }).format(value)
                    }
                  />
                  <Legend
                    content={renderCustomizedLegend}
                    layout="vertical"
                    verticalAlign="middle"
                    align="right"
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          {/* <div className="lg:col-span-3 bg-white p-6 rounded-xl shadow-sm" title="Return On Ad Spend (ROAS) by channel.">
                    <div className="flex items-start justify-between">
                        <h3 className="text-lg font-bold text-gray-800">Channel Efficiency (ROAS)</h3>
                        <button className="text-gray-400 hover:text-gray-600"><MoreHorizontalIcon /></button>
                    </div>
                    <div className="h-64 mt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data.channelEfficiencyData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#9ca3af" />
                                <YAxis stroke="#9ca3af" />
                                <Tooltip cursor={{ fill: 'rgba(243, 244, 246, 0.5)' }} />
                                <Bar dataKey="roas" fill="#0ea5e9" barSize={30} radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div> */}
        </div>
        <div
          className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm"
          title="Paid advertising campaigns overview."
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-gray-800">
              Paid Media Performance
            </h3>
            <a
              href="#"
              className="text-sm font-semibold text-blue-600 hover:underline"
            >
              View Detailed Report
            </a>
          </div>
          <div className="overflow-x-auto">
            <h4 className="font-bold text-gray-800 mb-2">
              Top Performing Campaigns
            </h4>
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
                </tr>
              </thead>
              <tbody>
                {data.topCampaigns?.length > 0 ? (
                  data.topCampaigns.map((c, i) => (
                    <tr key={i} className="bg-white border-b hover:bg-gray-50">
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
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                      No campaign data available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Social Media Competition */}
        <div className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-gray-800">
              Social Media Competition
            </h3>
            <a
              href="#"
              className="text-sm font-semibold text-blue-600 hover:underline"
            >
              View Competitors
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {data.socialMediaCompetitionMetrics?.map((metric) => (
              <MetricCard key={metric.title} metric={metric} />
            ))}
          </div>

          {/* Share of Voice Bar Chart */}
          <div className="h-64 mt-6">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.socialMediaCompetitionChart || []}>
                <XAxis dataKey="competitor" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip />
                <Legend />
                <Bar dataKey="sov" fill="#0ea5e9" name="Share of Voice" />
                <Bar
                  dataKey="engagementRate"
                  fill="#34d399"
                  name="Engagement Rate %"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Social Media Content Performance */}
        <div className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-gray-800">
              Social Media Content Performance
            </h3>
            <a
              href="#"
              className="text-sm font-semibold text-blue-600 hover:underline"
            >
              View Content
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {data.socialMediaContentPerformanceMetrics?.map((metric) => (
              <MetricCard key={metric.title} metric={metric} />
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Campaign Objectives Performance */}
            <div className="h-64">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Performance by Campaign Objective</h4>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.campaignObjectiveData || []}>
                  <XAxis
                    dataKey="objective"
                    stroke="#9ca3af"
                    tick={{ fontSize: 10, fill: "#374151", dy: 10 }}
                  />
                  <YAxis
                    stroke="#9ca3af"
                    tick={{ fontSize: 12, fill: "#374151" }}
                  />
                  <Tooltip />
                  <Bar dataKey="spend" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Monthly Spend Trend */}
            <div className="h-64">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Monthly Spend Trend</h4>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.monthlySpendData || []}>
                  <XAxis dataKey="month" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="spend"
                    stroke="#10b981"
                    fill="#10b98120"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Social Listening Metrics */}
        <div className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-gray-800">
              Social Listening Metrics
            </h3>
            <a
              href="#"
              className="text-sm font-semibold text-blue-600 hover:underline"
            >
              View Trends
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {data.socialListeningMetrics?.map((metric) => (
              <MetricCard key={metric.title} metric={metric} />
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Performing Products */}
            <div className="h-64">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Top Performing Products</h4>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.productPerformanceData || []}>
                  <XAxis
                    dataKey="product"
                    stroke="#9ca3af"
                    tick={{ fontSize: 10, fill: "#374151", dy: 10 }}
                  />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip />
                  <Bar dataKey="leads" fill="#f59e0b" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Campaign Funnel Performance */}
            <div className="h-64">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Campaign Funnel Performance</h4>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.funnelPerformanceData || []}>
                  <XAxis dataKey="funnel" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip />
                  <Bar dataKey="campaigns" fill="#8b5cf6" />
                  <Bar dataKey="avgSpend" fill="#ec4899" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div
        className={`p-6 rounded-xl shadow-sm ${data ? 'bg-white border border-gray-200' : 'bg-gray-50 border-2 border-gray-200'}`}
        title="Use the AI-powered search to ask questions about your marketing data."
      >
        <h1 className="text-3xl font-bold text-gray-800">
          Get Insight Smarter
        </h1>
        <form onSubmit={handlePromptSubmit} className="relative mt-4">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={`Try "Give me the most outstanding campaign for ${selectedBrand} in this quarter"`}
            className="w-full pl-4 pr-14 py-3 border border-gray-300 rounded-full focus:ring-2 focus:ring-brand-pink focus:border-brand-pink transition-all disabled:bg-gray-100"
            disabled={isAiLoading}
          />
          <button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-brand-pink text-white rounded-full flex items-center justify-center hover:bg-brand-pink/90 disabled:bg-gray-200 disabled:text-gray-400"
            disabled={isAiLoading || !prompt.trim()}
            aria-label="Submit prompt"
          >
            {isAiLoading && !aiConversation.length ? (
              <LoaderIcon className="w-5 h-5 animate-spin" />
            ) : (
              <SendIcon className="w-5 h-5" />
            )}
          </button>
        </form>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {suggestedPrompts.map((p) => (
            <button
              key={p}
              disabled={isAiLoading}
              onClick={() => setPrompt(p)}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold shadow-sm disabled:opacity-50 transition-colors ${
                prompt === p
                  ? "bg-brand-pink text-white hover:bg-brand-pink/90"
                  : "bg-white border border-gray-300 text-gray-600 hover:bg-gray-100"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <OverviewContent data={data} isLoading={isDataLoading} />
    </div>
  );
};

export default Dashboard;
