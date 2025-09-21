import { CampaignDataService } from '../lib/campaignDataService';
import type { Brand, AllBrandsData, DashboardData } from '../types';

export const getRealCampaignData = async (brand: Brand): Promise<DashboardData> => {
  try {
    console.log(`🔄 Fetching real-time data for brand: ${brand}`);
    
    // Fetch real campaign data from Supabase with brand filter
    const campaigns = await CampaignDataService.getCampaignData(brand);
    
    console.log(`📊 Found ${campaigns.length} campaigns for ${brand}`);
    
    // Transform to dashboard format (now async for competitor analysis)
    const dashboardData = await CampaignDataService.transformToDashboardData(campaigns, brand);
    
    return dashboardData;
  } catch (error) {
    console.error(`❌ Error fetching campaign data for ${brand}:`, error);
    
    // Fallback to empty data structure if real data fails
    return createEmptyDashboardData(brand);
  }
};

export const getAllRealCampaignData = async (): Promise<AllBrandsData> => {
  const brands: Brand[] = ['The Palace', 'Frank & Co', 'Mondial', 'Laku Emas'];
  const allData: AllBrandsData = {} as AllBrandsData;
  console.log(`🔄 getAllRealCampaignData: Fetching data for brands: ${brands.join(', ')}`);
  
  // Fetch data for all brands in parallel
  const promises = brands.map(async (brand) => {
    const data = await getRealCampaignData(brand);
    return { brand, data };
  });
  
  const results = await Promise.all(promises);
  
  // Combine results
  results.forEach(({ brand, data }) => {
    allData[brand] = data;
  });
  
  return allData;
};

// Helper function to create empty data structure
const createEmptyDashboardData = (brand: Brand): DashboardData => {
  return {
    executiveMetrics: [],
    secondaryMetrics: [
      {
        title: "Amount Spent",
        value: "Rp0",
        change: "-",
        isPositive: false,
        period: "No data available",
        tooltip: "Total ad spend.",
      },
      {
        title: "Impressions",
        value: "0",
        change: "-",
        isPositive: true,
        period: "No data available",
        tooltip: "Total ad impressions.",
      },
      {
        title: "Leads",
        value: "0",
        change: "-",
        isPositive: true,
        period: "No data available",
        tooltip: "Total leads generated.",
      },
    ],
    revenueByChannelData: [],
    channelEfficiencyData: [],
    topCampaigns: [],
    organicSearchOverviewMetrics: [],
    topPages: [],
    alerts: [
      {
        id: 1,
        type: "warning",
        title: "No Campaign Data Available",
        description: `No campaign data found for ${brand}. This could be due to: 1) No campaigns running for this brand, 2) Data sync issues, or 3) Database connectivity problems.`,
      },
    ],
    paidMediaTabMetrics: [],
    paidMediaPerformanceData: [],
    spendByPlatformData: [],
    organicSearchTabMetrics: [],
    organicTrafficData: [],
    topKeywords: [],
    socialMediaMetrics: [],
    followerGrowthData: [],
    ecommerceMetrics: [],
    salesOverTimeData: [],
    topSellingProducts: [],
    forecastMetrics: [],
    revenueForecastData: [],
    forecastAlerts: [],
    kols: [],
    publishers: [],
    offlineCampaigns: [],
    competitorBenchmarkingMetrics: [],
    socialMediaContentPerformanceMetrics: [],
    socialMediaCompetitionMetrics: [],
    socialMediaCompetitionChart: [],
    socialMediaContentPerformance: [],
    topPosts: [],
    videoCompletionTrend: [],
    socialListeningMetrics: [],
    sentimentTrend: [],
    trendingHashtags: [],
    recommendations: [
      {
        title: "Check Data Connection",
        description: "Verify that your Supabase connection is working and that campaign data is properly synced for this brand.",
      },
      {
        title: "Data Integration Setup",
        description: "If this is a new brand, set up campaign data integration to start tracking marketing performance and generate actionable insights.",
      },
    ],
  };
};

// Real-time data fetching - no caching needed