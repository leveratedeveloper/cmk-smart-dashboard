export type Brand = "The Palace" | "Frank & Co" | "Mondial" | "Laku Emas";

export interface BrandConfig {
  id: Brand;
  displayName: string;
  databaseValues: string[]; // Array of possible database values for this brand
}

export const BRAND_CONFIG: BrandConfig[] = [
  {
    id: "The Palace",
    displayName: "The Palace",
    databaseValues: ["ThePalace"]
  },
  {
    id: "Frank & Co",
    displayName: "Frank & Co",
    databaseValues: ["Franknco", "Frank&co"]
  },
  {
    id: "Mondial",
    displayName: "Mondial", 
    databaseValues: ["Mondial"]
  },
  {
    id: "Laku Emas",
    displayName: "Laku Emas",
    databaseValues: ["LakuEmas"]
  }
];

export type ActiveView =
  | "dashboard"
  | "chatLogs"
  | "settings"
  | "report-paid-media"
  | "report-organic-search"
  | "report-social-media"
  | "report-ecommerce"
  | "report-kol"
  | "report-publishers"
  | "report-offline-media"
  | "report-competitor-benchmarking"
  | "report-social-listening";

export type RoleId = "c-level" | "director" | "manager" | "analyst";

export interface RolePermissions {
  canViewAllBrands: boolean;
  allowedReports: ActiveView[]; // List of report views they can see
  canManageUsers: boolean;
}

export interface UserRole {
  id: RoleId;
  name: string;
  description: string;
  permissions: RolePermissions;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  roleId: RoleId;
  assignedBrands: Brand[];
  status: "Active" | "Invited";
}

export interface Metric {
  title: string;
  value: string;
  change: string;
  isPositive: boolean;
  period: string;
  tooltip?: string;
}

export interface PieChartData {
  name: string;
  value: number;
  color: string;
  revenue: string;
}

export interface BarChartData {
  name: string;
  roas: number;
}

export interface Campaign {
  name: string;
  platform: string;
  spend: string;
  revenue: string;
  roas: string;
  cpa: string;
  conversions: string;
}

export interface LandingPage {
  path: string;
  sessions: string;
  bounceRate: string;
  avgTime: string;
  conversions: string;
}

export type AlertType = "warning" | "danger" | "info" | "success";

export interface Alert {
  id: number;
  type: AlertType;
  title: string;
  description: string;
}

export interface AIRecommendation {
  title: string;
  description: string;
}

export interface AIResponse {
  summary: string;
  keyFinding: {
    title: string;
    value: string;
    change: string;
  };
  data: string[][];
  recommendations: AIRecommendation[];
  followUpQuestions: string[];
}

export interface ConversationItem {
  sender: "user" | "ai";
  userPrompt?: string;
  aiResponse?: AIResponse;
  isLoading?: boolean;
  error?: string;
}

export interface KOL {
  name: string;
  platform: "Instagram" | "TikTok" | "YouTube";
  followers: string;
  engagementRate: string;
  cost: string;
  attributedRevenue: string;
  roi: string;
}

export interface Publisher {
  name: string;
  category: "News" | "Fashion" | "Lifestyle";
  impressions: string;
  clicks: string;
  spend: string;
  revenue: string;
}

export interface OfflineCampaign {
  name: string;
  channel: "TV" | "Radio" | "Print Magazine";
  budget: string;
  estimatedReach: string;
  measuredImpact: string; // e.g., "15% uplift in direct traffic"
}

export interface ChatMessage {
  sender: "user" | "ai";
  text: string;
  timestamp: string;
}

export interface ChatLog {
  id: string;
  user_id: string;
  title: string;
  conversation: ConversationItem[];
  created_at: string;
}

export interface ReportWidget {
  id: string;
  name: string;
  description: string;
}

export type IntegrationCategory =
  | "Calendars"
  | "Marketing"
  | "Email messaging"
  | "Sales and CRM";

export interface Integration {
  id: string;
  name: string;
  description: string;
  icon: React.FC<{ className?: string }>;
  categories: IntegrationCategory[];
  connected: boolean;
  mostUsed?: boolean;
}

// Data structure for a single brand's complete dashboard
export interface DashboardData {
  executiveMetrics: Metric[];
  secondaryMetrics: Metric[];
  revenueByChannelData: PieChartData[];
  channelEfficiencyData: BarChartData[];
  topCampaigns: Campaign[];
  organicSearchOverviewMetrics: Metric[];
  topPages: LandingPage[];
  alerts: Alert[];
  paidMediaTabMetrics: Metric[];
  paidMediaPerformanceData: any[];
  spendByPlatformData: any[];
  organicSearchTabMetrics: Metric[];
  organicTrafficData: any[];
  topKeywords: any[];
  socialMediaMetrics: Metric[];
  followerGrowthData: any[];
  ecommerceMetrics: Metric[];
  salesOverTimeData: any[];
  topSellingProducts: any[];
  forecastMetrics: Metric[];
  revenueForecastData: any[];
  forecastAlerts: Alert[];
  kols: KOL[];
  publishers: Publisher[];
  offlineCampaigns: OfflineCampaign[];
  competitorBenchmarkingMetrics: Metric[];
  socialMediaContentPerformanceMetrics: Metric[];
  socialMediaCompetitionMetrics: Metric[];
  socialMediaCompetitionChart: {
    competitor: string;
    sov: number;
    engagementRate: number;
    followerGrowth: number;
  }[];
  socialMediaContentPerformance: Metric[];
  topPosts: { title: string; engagement: number }[];
  videoCompletionTrend: { week: string; completionRate: number }[];
  socialListeningMetrics: Metric[];
  sentimentTrend: {
    week: string;
    positive: number;
    neutral: number;
    negative: number;
  }[];
  trendingHashtags: { hashtag: string; mentions: number }[];
  recommendations: AIRecommendation[];
  
  // New chart data from campaign_staging
  campaignObjectiveData: { objective: string; spend: number; campaigns: number }[];
  monthlySpendData: { month: string; spend: number }[];
  productPerformanceData: { product: string; leads: number; spend: number }[];
  funnelPerformanceData: { funnel: string; campaigns: number; avgSpend: number }[];
}

export type AllBrandsData = Record<Brand, DashboardData>;
