import { supabase } from './supabase';
import type { Database } from './database.types';
import type { Brand, DashboardData, Metric, PieChartData, Campaign, Alert, AIRecommendation } from '../types';
import { BRAND_CONFIG } from '../types';
import { competitorAnalysisService, type CompetitorAnalysis } from './competitorAnalysisService';

type CampaignRow = Database['public']['Tables']['campaign_staging']['Row'];

// Utility function to safely parse numbers
const parseNumber = (value: string | null): number => {
  if (!value || value === '0' || value === 'null') return 0;
  return parseInt(value.replace(/,/g, ''), 10) || 0;
};

// Utility function to format currency
const formatCurrency = (value: number): string => {
  return `Rp${value.toLocaleString('id-ID')}`;
};

// Utility function to format large numbers
const formatLargeNumber = (value: number): string => {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  } else if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  }
  return value.toLocaleString();
};

// Map campaign brand names to our brand types using brand configuration
const mapBrandName = (campaignBrand: string | null): Brand | null => {
  if (!campaignBrand) return null;
  
  // Find the brand config that contains this database value
  const brandConfig = BRAND_CONFIG.find(config => 
    config.databaseValues.includes(campaignBrand)
  );
  
  return brandConfig?.id || null;
};

export class CampaignDataService {
  
  static async getCampaignData(brand?: Brand): Promise<CampaignRow[]> {
    console.log(`🔍 CampaignDataService.getCampaignData called for brand: ${brand}`);
    let query = supabase.from('campaign_staging').select('*');
    
    if (brand) {
      // Get all database values for this brand
      const brandConfig = BRAND_CONFIG.find(config => config.id === brand);
      console.log(`📋 CampaignDataService: Brand config found:`, brandConfig);
      
      if (brandConfig && brandConfig.databaseValues.length > 0) {
        console.log(`🔎 CampaignDataService: Querying for database values: [${brandConfig.databaseValues.join(', ')}]`);
        // Query for all database values for this brand (handles multiple variants like Franknco and Frank&co)
        query = query.in('Brand', brandConfig.databaseValues);
      } else {
        console.warn(`⚠️ CampaignDataService: No brand config found for ${brand}`);
      }
    } else {
      console.log(`📊 CampaignDataService: No brand filter, fetching all campaigns`);
    }
    
    console.log(`🚀 CampaignDataService: Executing Supabase query...`);
    const { data, error } = await query;
    
    if (error) {
      console.error('❌ CampaignDataService: Error fetching campaign data:', error);
      throw error;
    }
    
    console.log(`✅ CampaignDataService: Successfully fetched ${data?.length || 0} campaigns for ${brand}`);
    return data || [];
  }

  static async transformToDashboardData(campaigns: CampaignRow[], brand: Brand): Promise<DashboardData> {
    console.log(`🔄 CampaignDataService.transformToDashboardData called for brand: ${brand}`);
    console.log(`📥 CampaignDataService: Input campaigns count: ${campaigns.length}`);
    
    // Filter campaigns for the specific brand
    const brandCampaigns = campaigns.filter(c => mapBrandName(c.Brand) === brand);
    console.log(`🎯 CampaignDataService: Filtered brand campaigns count: ${brandCampaigns.length}`);
    
    // Fetch real-time competitor analysis
    console.log(`🔍 CampaignDataService: Fetching competitor analysis for ${brand}...`);
    let competitorAnalysis: CompetitorAnalysis | null = null;
    try {
      competitorAnalysis = await competitorAnalysisService.analyzeCompetitors(brand);
      console.log(`✅ CampaignDataService: Competitor analysis completed for ${brand}`);
    } catch (error) {
      console.warn(`⚠️ CampaignDataService: Competitor analysis failed for ${brand}:`, error);
    }
    
    // Calculate aggregate metrics
    const totalSpent = brandCampaigns.reduce((sum, c) => sum + parseNumber(c["Amount Spent"]), 0);
    const totalImpressions = brandCampaigns.reduce((sum, c) => sum + parseNumber(c.Impressions), 0);
    const totalReach = brandCampaigns.reduce((sum, c) => sum + parseNumber(c.Reach), 0);
    const totalClicks = brandCampaigns.reduce((sum, c) => sum + parseNumber(c.Clicks), 0);
    const totalLeads = brandCampaigns.reduce((sum, c) => sum + parseNumber(c.Leads), 0);
    const totalEngagements = brandCampaigns.reduce((sum, c) => sum + parseNumber(c["Post Engagements"]), 0);
    const totalStoreVisits = brandCampaigns.reduce((sum, c) => sum + parseNumber(c["Store Visits"]), 0);
    const totalVideoViews = brandCampaigns.reduce((sum, c) => sum + parseNumber(c["Video Views"]), 0);
    const totalUsers = brandCampaigns.reduce((sum, c) => sum + parseNumber(c["Total User"]), 0);
    const totalSessions = brandCampaigns.reduce((sum, c) => sum + parseNumber(c["Session GA4"]), 0);
    const totalConversationStarted = brandCampaigns.reduce((sum, c) => sum + parseNumber(c["Conversation Started"]), 0);
    
    // Calculate derived metrics
    const cpm = totalImpressions > 0 ? (totalSpent / totalImpressions) * 1000 : 0;
    const ctr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
    const cpl = totalLeads > 0 ? totalSpent / totalLeads : 0;
    const costPerStoreVisit = totalStoreVisits > 0 ? totalSpent / totalStoreVisits : 0;
    
    // Create secondary metrics
    const secondaryMetrics: Metric[] = [
      {
        title: "Amount Spent",
        value: formatCurrency(totalSpent),
        change: "-",
        isPositive: false,
        period: "this month",
        tooltip: "Total advertising spend across all channels.",
      },
      {
        title: "Store Visits",
        value: formatLargeNumber(totalStoreVisits),
        change: "-",
        isPositive: true,
        period: "this month",
        tooltip: "Store visits attributed to campaigns.",
      },
      {
        title: "Website Users (GA4)",
        value: formatLargeNumber(totalUsers),
        change: "-",
        isPositive: true,
        period: "this month",
        tooltip: "Total unique users tracked by Google Analytics.",
      },
      {
        title: "Website Sessions (GA4)",
        value: formatLargeNumber(totalSessions),
        change: "-",
        isPositive: true,
        period: "this month",
        tooltip: "Total sessions tracked by Google Analytics.",
      },
      {
        title: "Video Views",
        value: formatLargeNumber(totalVideoViews),
        change: "-",
        isPositive: true,
        period: "this month",
        tooltip: "Total video ad views.",
      },
      {
        title: "Conversation Started",
        value: formatLargeNumber(totalConversationStarted),
        change: "-",
        isPositive: true,
        period: "this month",
        tooltip: "Total conversations initiated through campaigns.",
      },
    ];

    // Create revenue by channel data (group by channel)
    const channelData = brandCampaigns.reduce((acc, campaign) => {
      const channel = campaign.Channel || 'Unknown';
      if (!acc[channel]) {
        acc[channel] = { spent: 0, campaigns: 0 };
      }
      acc[channel].spent += parseNumber(campaign["Amount Spent"]);
      acc[channel].campaigns += 1;
      return acc;
    }, {} as Record<string, { spent: number; campaigns: number }>);

    const colors = ['#0ea5e9', '#3b82f6', '#10b981', '#f97316', '#8b5cf6'];
    const revenueByChannelData: PieChartData[] = Object.entries(channelData)
      .map(([channel, data], index) => ({
        name: channel,
        value: data.spent,
        color: colors[index % colors.length],
        revenue: formatCurrency(data.spent),
      }))
      .sort((a, b) => b.value - a.value);

    // Create top campaigns
    const topCampaigns: Campaign[] = brandCampaigns
      .filter(c => parseNumber(c["Amount Spent"]) > 0)
      .sort((a, b) => parseNumber(b["Amount Spent"]) - parseNumber(a["Amount Spent"]))
      .slice(0, 5)
      .map(campaign => {
        const spent = parseNumber(campaign["Amount Spent"]);
        const leads = parseNumber(campaign.Leads);
        const clicks = parseNumber(campaign.Clicks);
        const cplCampaign = leads > 0 ? spent / leads : 0;
        
        return {
          name: campaign["Campaign Name"],
          platform: campaign.Channel || 'Meta',
          spend: formatCurrency(spent),
          revenue: formatCurrency(Math.round(spent * 1.5)), // Estimated revenue
          roas: "1.5x", // Placeholder ROAS
          cpa: formatCurrency(Math.round(cplCampaign)),
          conversions: leads.toString(),
        };
      });

    // Create alerts based on campaign performance
    const alerts: Alert[] = [];
    
    // Alert for high spending campaigns with low leads
    const highSpendLowLeads = brandCampaigns.filter(c => {
      const spent = parseNumber(c["Amount Spent"]);
      const leads = parseNumber(c.Leads);
      return spent > 500000 && leads < 10;
    });
    
    if (highSpendLowLeads.length > 0) {
      alerts.push({
        id: 1,
        type: "warning",
        title: `High Spend, Low Leads on ${brand}`,
        description: `${highSpendLowLeads.length} campaigns are spending heavily but generating few leads. Review campaign targeting and creatives.`,
      });
    }

    // Alert for campaigns with zero performance
    const zeroPerfCampaigns = brandCampaigns.filter(c => 
      parseNumber(c["Amount Spent"]) > 0 && 
      parseNumber(c.Leads) === 0 && 
      parseNumber(c.Clicks) === 0
    );

    if (zeroPerfCampaigns.length > 0) {
      alerts.push({
        id: 2,
        type: "danger", 
        title: "Underperforming Campaigns",
        description: `${zeroPerfCampaigns.length} campaigns are spending budget but generating no leads or clicks. Consider pausing or optimizing.`,
      });
    }

    // Create recommendations based on data insights
    const recommendations: AIRecommendation[] = [];
    
    // Recommendation based on channel performance
    const metaSpend = channelData['Meta']?.spent || 0;
    const totalChannelSpend = Object.values(channelData).reduce((sum, data) => sum + data.spent, 0);
    const metaShare = totalChannelSpend > 0 ? (metaSpend / totalChannelSpend) * 100 : 0;
    
    if (metaShare > 80) {
      recommendations.push({
        title: "Diversify Channel Strategy",
        description: `${metaShare.toFixed(1)}% of ad spend is on Meta platforms. Consider diversifying across Google Ads, LinkedIn, and other channels to reduce dependency and capture additional audiences.`,
      });
    }

    // Recommendation based on lead efficiency  
    if (cpl > 50000) {
      recommendations.push({
        title: "Optimize Lead Generation Cost",
        description: `Current cost per lead (${formatCurrency(Math.round(cpl))}) is above industry benchmarks. Focus on improving ad creative, targeting precision, and landing page conversion rates to reduce CPL by 20-30%.`,
      });
    } else if (totalLeads > 100) {
      recommendations.push({
        title: "Scale Successful Lead Generation",
        description: `Strong lead generation performance with ${totalLeads} leads at ${formatCurrency(Math.round(cpl))} CPL. Consider increasing budget by 25-40% to capture more market share while maintaining efficiency.`,
      });
    }

    // Recommendation for high-performing campaigns
    const topPerformer = brandCampaigns
      .filter(c => parseNumber(c.Leads) > 15)
      .sort((a, b) => parseNumber(b.Leads) - parseNumber(a.Leads))[0];
    
    if (topPerformer) {
      recommendations.push({
        title: "Scale Top Performing Campaign",
        description: `"${topPerformer["Campaign Name"]}" is generating ${topPerformer.Leads} leads efficiently. Consider increasing budget by 30-50% and expanding to similar audience segments.`,
      });
    }

    // Recommendation based on video performance
    if (totalVideoViews > 10000 && totalVideoViews > totalClicks * 3) {
      recommendations.push({
        title: "Leverage Video Content Success",
        description: `Video content is performing exceptionally well with ${formatLargeNumber(totalVideoViews)} views. Consider creating more video ads and allocating more budget to video-first campaigns to capitalize on high engagement.`,
      });
    }

    // Recommendation for engagement optimization
    const engagementRate = totalImpressions > 0 ? (totalEngagements / totalImpressions) * 100 : 0;
    if (engagementRate > 2) {
      recommendations.push({
        title: "High Engagement - Focus on Conversion",
        description: `Strong social engagement rate of ${engagementRate.toFixed(2)}%. Focus on conversion optimization through better landing pages and clearer calls-to-action to convert engaged users into leads.`,
      });
    }

    // Create executive metrics - main KPIs for the brand
    const executiveMetrics: Metric[] = [
      {
        title: "Total Leads",
        value: formatLargeNumber(totalLeads),
        change: "-",
        isPositive: true,
        period: "month to date", 
        tooltip: "Total leads generated across all campaigns.",
      },
      {
        title: "Total Clicks",
        value: formatLargeNumber(totalClicks),
        change: "-",
        isPositive: true,
        period: "month to date",
        tooltip: "Total clicks across all campaigns.",
      },
      {
        title: "Click-Through Rate",
        value: `${ctr.toFixed(2)}%`,
        change: "-",
        isPositive: true,
        period: "month to date",
        tooltip: "Percentage of people who clicked on ads after seeing them.",
      },
      {
        title: "Total Impressions",
        value: formatLargeNumber(totalImpressions),
        change: "-",
        isPositive: true,
        period: "month to date",
        tooltip: "Total number of times ads were displayed.",
      },
      {
        title: "Total Reach",
        value: formatLargeNumber(totalReach),
        change: "-",
        isPositive: true,
        period: "month to date",
        tooltip: "Total unique people who saw the ads.",
      },
      {
        title: "Total Engagements",
        value: formatLargeNumber(totalEngagements),
        change: "-",
        isPositive: true,
        period: "month to date",
        tooltip: "Total social media engagements.",
      },
    ];

    // Return the complete dashboard data structure
    return {
      executiveMetrics,
      secondaryMetrics,
      revenueByChannelData,
      channelEfficiencyData: Object.entries(channelData).map(([channel, data]) => ({
        name: channel,
        roas: data.spent > 0 ? ((data.spent * 1.5) / data.spent).toFixed(1) : "0.0", // Estimated 1.5x return
      })),
      topCampaigns,
      organicSearchOverviewMetrics: [],
      topPages: [],
      alerts,
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
      socialMediaContentPerformanceMetrics: this.createSocialContentMetrics(brandCampaigns),
      socialMediaCompetitionMetrics: this.createSocialCompetitionMetrics(brandCampaigns, competitorAnalysis),
      socialMediaCompetitionChart: this.createSocialCompetitionChart(brandCampaigns, competitorAnalysis),
      socialMediaContentPerformance: this.createSocialContentPerformance(brandCampaigns),
      topPosts: [],
      videoCompletionTrend: [],
      socialListeningMetrics: [],
      sentimentTrend: [],
      trendingHashtags: [
        { hashtag: "#jewelry", mentions: 1200 },
        { hashtag: "#luxury", mentions: 950 },
        { hashtag: "#wedding", mentions: 740 },
        { hashtag: "#engagement", mentions: 600 },
        { hashtag: "#diamond", mentions: 420 },
      ],
      recommendations,
      
      // New chart data from real campaign data
      campaignObjectiveData: this.createObjectiveData(brandCampaigns),
      monthlySpendData: this.createMonthlySpendData(brandCampaigns),
      productPerformanceData: this.createProductPerformanceData(brandCampaigns),
      funnelPerformanceData: this.createFunnelPerformanceData(brandCampaigns),
    };
  }

  // Social Media Content Performance Metrics
  static createSocialContentMetrics(campaigns: CampaignRow[]): Metric[] {
    const socialCampaigns = campaigns.filter(c => c.Channel === 'Meta' || c.Channel === 'Tiktok');
    
    if (socialCampaigns.length === 0) return [];

    const totalEngagements = socialCampaigns.reduce((sum, c) => sum + parseNumber(c["Post Engagements"]), 0);
    const totalVideoViews = socialCampaigns.reduce((sum, c) => sum + parseNumber(c["Video Views"]), 0);
    const totalImpressions = socialCampaigns.reduce((sum, c) => sum + parseNumber(c.Impressions), 0);
    const totalSpent = socialCampaigns.reduce((sum, c) => sum + parseNumber(c["Amount Spent"]), 0);
    
    const engagementRate = totalImpressions > 0 ? (totalEngagements / totalImpressions) * 100 : 0;
    const costPerEngagement = totalEngagements > 0 ? totalSpent / totalEngagements : 0;
    const videoViewRate = totalImpressions > 0 ? (totalVideoViews / totalImpressions) * 100 : 0;

    return [
      {
        title: "Total Engagements",
        value: formatLargeNumber(totalEngagements),
        change: "-",
        isPositive: true,
        period: "this month",
        tooltip: "Total post engagements across social campaigns.",
      },
      {
        title: "Engagement Rate",
        value: `${engagementRate.toFixed(2)}%`,
        change: "-",
        isPositive: true,
        period: "this month",
        tooltip: "Percentage of impressions that resulted in engagements.",
      },
      {
        title: "Video Views",
        value: formatLargeNumber(totalVideoViews),
        change: "-",
        isPositive: true,
        period: "this month",
        tooltip: "Total video views across social campaigns.",
      },
      {
        title: "Cost Per Engagement",
        value: formatCurrency(Math.round(costPerEngagement)),
        change: "-",
        isPositive: false,
        period: "this month",
        tooltip: "Average cost per social media engagement.",
      },
    ];
  }

  // Social Media Competition Metrics (Real-time Competitor Analysis)
  static createSocialCompetitionMetrics(campaigns: CampaignRow[], competitorAnalysis: CompetitorAnalysis | null): Metric[] {
    if (!competitorAnalysis || !competitorAnalysis.competitors.length) {
      // Fallback to platform comparison if no competitor data
      const metaCampaigns = campaigns.filter(c => c.Channel === 'Meta');
      const tiktokCampaigns = campaigns.filter(c => c.Channel === 'Tiktok');
      const metaSpend = metaCampaigns.reduce((sum, c) => sum + parseNumber(c["Amount Spent"]), 0);
      const tiktokSpend = tiktokCampaigns.reduce((sum, c) => sum + parseNumber(c["Amount Spent"]), 0);
      
      return [
        {
          title: "Our Meta Spend",
          value: formatCurrency(metaSpend),
          change: "vs competitors",
          isPositive: true,
          period: "this month",
          tooltip: "Our Meta advertising spend this month.",
        },
        {
          title: "Our TikTok Spend", 
          value: formatCurrency(tiktokSpend),
          change: "vs competitors",
          isPositive: true,
          period: "this month",
          tooltip: "Our TikTok advertising spend this month.",
        },
      ];
    }

    // Use real-time competitor data from Gemini API
    const topCompetitors = competitorAnalysis.competitors.slice(0, 4);
    
    return topCompetitors.map((competitor, index) => ({
      title: competitor.competitor,
      value: `$${formatLargeNumber(competitor.estimatedSpend)}`,
      change: `${competitor.engagementRate.toFixed(1)}% engagement rate`,
      isPositive: competitor.followerGrowth > 0,
      period: "estimated monthly",
      tooltip: `${competitor.contentStrategy}. Follower growth: ${competitor.followerGrowth > 0 ? '+' : ''}${competitor.followerGrowth.toFixed(1)}%`,
    }));
  }

  // Social Media Competition Chart Data
  static createSocialCompetitionChart(campaigns: CampaignRow[], competitorAnalysis: CompetitorAnalysis | null): { competitor: string; sov: number; engagementRate: number; followerGrowth: number }[] {
    if (competitorAnalysis && competitorAnalysis.competitors.length > 0) {
      // Use real competitor data from Gemini API
      console.log(`📊 CampaignDataService: Creating competition chart with ${competitorAnalysis.competitors.length} competitors`);
      
      return competitorAnalysis.competitors.map(competitor => ({
        competitor: competitor.competitor,
        sov: Math.round((competitor.estimatedSpend / 1000000) * 100), // Convert to percentage for share of voice
        engagementRate: parseFloat((competitor.engagementRate * 100).toFixed(1)), // Convert to percentage  
        followerGrowth: parseFloat(competitor.followerGrowth.toFixed(1))
      }));
    } else {
      console.log('📊 CampaignDataService: No competitor analysis available, using platform fallback data');
      
      // Fallback to platform comparison with mock competitor names
      const platformData = campaigns.reduce((acc, campaign) => {
        const platform = campaign.Channel;
        if (platform === 'Meta' || platform === 'Tiktok') {
          if (!acc[platform]) {
            acc[platform] = { spend: 0, engagement: 0, impressions: 0 };
          }
          acc[platform].spend += parseNumber(campaign["Amount Spent"]);
          acc[platform].engagement += parseNumber(campaign["Post Engagements"]);
          acc[platform].impressions += parseNumber(campaign["Impressions"]);
        }
        return acc;
      }, {} as Record<string, { spend: number; engagement: number; impressions: number }>);

      return Object.entries(platformData).map(([platform, data]) => {
        const engagementRate = data.impressions > 0 ? (data.engagement / data.impressions) * 100 : 0;
        return {
          competitor: platform === 'Meta' ? 'Meta Ads' : 'TikTok Ads',
          sov: Math.round((data.spend / 100000) * 10), // Mock share of voice based on spend
          engagementRate: parseFloat(engagementRate.toFixed(1)),
          followerGrowth: parseFloat((Math.random() * 10 - 2).toFixed(1)) // Random follower growth for fallback
        };
      });
    }
  }

  // Social Media Content Performance Details
  static createSocialContentPerformance(campaigns: CampaignRow[]): Metric[] {
    const socialCampaigns = campaigns.filter(c => c.Channel === 'Meta' || c.Channel === 'Tiktok');
    
    if (socialCampaigns.length === 0) return [];

    // Calculate video vs non-video performance
    const videoCampaigns = socialCampaigns.filter(c => parseNumber(c["Video Views"]) > 0);
    const nonVideoCampaigns = socialCampaigns.filter(c => parseNumber(c["Video Views"]) === 0);
    
    const videoEngagements = videoCampaigns.reduce((sum, c) => sum + parseNumber(c["Post Engagements"]), 0);
    const nonVideoEngagements = nonVideoCampaigns.reduce((sum, c) => sum + parseNumber(c["Post Engagements"]), 0);
    
    const videoSpend = videoCampaigns.reduce((sum, c) => sum + parseNumber(c["Amount Spent"]), 0);
    const nonVideoSpend = nonVideoCampaigns.reduce((sum, c) => sum + parseNumber(c["Amount Spent"]), 0);
    
    const videoROI = videoSpend > 0 ? videoEngagements / videoSpend : 0;
    const nonVideoROI = nonVideoSpend > 0 ? nonVideoEngagements / nonVideoSpend : 0;

    return [
      {
        title: "Video Content Campaigns",
        value: videoCampaigns.length.toString(),
        change: `${formatLargeNumber(videoEngagements)} engagements`,
        isPositive: true,
        period: "this month",
        tooltip: "Campaigns featuring video content.",
      },
      {
        title: "Image Content Campaigns",
        value: nonVideoCampaigns.length.toString(),
        change: `${formatLargeNumber(nonVideoEngagements)} engagements`,
        isPositive: true,
        period: "this month",
        tooltip: "Campaigns featuring image/static content.",
      },
      {
        title: "Video Engagement ROI",
        value: videoROI.toFixed(2),
        change: "engagements per rupiah",
        isPositive: true,
        period: "this month",
        tooltip: "Engagement efficiency for video content.",
      },
      {
        title: "Image Engagement ROI",
        value: nonVideoROI.toFixed(2),
        change: "engagements per rupiah",
        isPositive: true,
        period: "this month",
        tooltip: "Engagement efficiency for image content.",
      },
    ];
  }

  // Campaign Objective Performance Data
  static createObjectiveData(campaigns: CampaignRow[]): { objective: string; spend: number; campaigns: number }[] {
    const objectiveData = campaigns.reduce((acc, campaign) => {
      const objective = campaign.Objective || 'Unknown';
      if (!acc[objective]) {
        acc[objective] = { spend: 0, campaigns: 0 };
      }
      acc[objective].spend += parseNumber(campaign["Amount Spent"]);
      acc[objective].campaigns += 1;
      return acc;
    }, {} as Record<string, { spend: number; campaigns: number }>);

    return Object.entries(objectiveData)
      .map(([objective, data]) => ({
        objective,
        spend: data.spend,
        campaigns: data.campaigns,
      }))
      .sort((a, b) => b.spend - a.spend)
      .slice(0, 7); // Top 7 objectives
  }

  // Monthly Spend Data
  static createMonthlySpendData(campaigns: CampaignRow[]): { month: string; spend: number }[] {
    const monthlyData = campaigns.reduce((acc, campaign) => {
      const month = campaign.Month || 'Unknown';
      if (!acc[month]) {
        acc[month] = 0;
      }
      acc[month] += parseNumber(campaign["Amount Spent"]);
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(monthlyData)
      .map(([month, spend]) => ({ month, spend }))
      .sort((a, b) => a.month.localeCompare(b.month));
  }

  // Product Performance Data
  static createProductPerformanceData(campaigns: CampaignRow[]): { product: string; leads: number; spend: number }[] {
    const productData = campaigns.reduce((acc, campaign) => {
      const product = campaign.Product || 'Unknown';
      if (!acc[product]) {
        acc[product] = { leads: 0, spend: 0 };
      }
      acc[product].leads += parseNumber(campaign.Leads);
      acc[product].spend += parseNumber(campaign["Amount Spent"]);
      return acc;
    }, {} as Record<string, { leads: number; spend: number }>);

    return Object.entries(productData)
      .map(([product, data]) => ({
        product: product.length > 15 ? product.substring(0, 15) + '...' : product, // Truncate long names
        leads: data.leads,
        spend: data.spend,
      }))
      .sort((a, b) => b.leads - a.leads)
      .slice(0, 10); // Top 10 products
  }

  // Funnel Performance Data
  static createFunnelPerformanceData(campaigns: CampaignRow[]): { funnel: string; campaigns: number; avgSpend: number }[] {
    const funnelData = campaigns.reduce((acc, campaign) => {
      const funnel = campaign.Funnels || 'Unknown';
      if (!acc[funnel]) {
        acc[funnel] = { totalSpend: 0, campaigns: 0 };
      }
      acc[funnel].totalSpend += parseNumber(campaign["Amount Spent"]);
      acc[funnel].campaigns += 1;
      return acc;
    }, {} as Record<string, { totalSpend: number; campaigns: number }>);

    return Object.entries(funnelData)
      .map(([funnel, data]) => ({
        funnel,
        campaigns: data.campaigns,
        avgSpend: data.campaigns > 0 ? Math.round(data.totalSpend / data.campaigns) : 0,
      }))
      .sort((a, b) => b.campaigns - a.campaigns);
  }
}