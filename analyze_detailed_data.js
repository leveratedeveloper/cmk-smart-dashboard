import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

// Read environment variables from .env.local
let supabaseUrl, supabaseAnonKey;
try {
    const envContent = readFileSync('.env.local', 'utf8');
    const envLines = envContent.split('\n');
    for (const line of envLines) {
        if (line.startsWith('VITE_SUPABASE_URL=')) {
            supabaseUrl = line.split('=')[1].replace(/['\"]/g, '');
        } else if (line.startsWith('VITE_SUPABASE_ANON_KEY=')) {
            supabaseAnonKey = line.split('=')[1].replace(/['\"]/g, '');
        }
    }
} catch (error) {
    console.error('Error reading .env.local file:', error);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function getDetailedAnalysis() {
    console.log('🔍 Getting detailed campaign analysis...\n');
    
    // Get unique channels
    const { data: channels } = await supabase
        .from('campaign_staging')
        .select('Channel')
        .not('Channel', 'is', null);
        
    if (channels) {
        const uniqueChannels = [...new Set(channels.map(c => c.Channel))];
        console.log('📺 Available Channels:', uniqueChannels);
    }
    
    // Get unique objectives
    const { data: objectives } = await supabase
        .from('campaign_staging')
        .select('Objective')
        .not('Objective', 'is', null);
        
    if (objectives) {
        const uniqueObjectives = [...new Set(objectives.map(o => o.Objective))];
        console.log('🎯 Available Objectives:', uniqueObjectives);
    }
    
    // Get unique funnels
    const { data: funnels } = await supabase
        .from('campaign_staging')
        .select('Funnels')
        .not('Funnels', 'is', null);
        
    if (funnels) {
        const uniqueFunnels = [...new Set(funnels.map(f => f.Funnels))];
        console.log('🔄 Available Funnels:', uniqueFunnels);
    }
    
    // Get some sample data to understand metrics better
    console.log('\n📊 Sample performance data:');
    const { data: sample } = await supabase
        .from('campaign_staging')
        .select('*')
        .eq('Brand', 'Franknco')
        .limit(3);
        
    if (sample) {
        sample.forEach((campaign, i) => {
            console.log(`\nCampaign ${i+1}: ${campaign['Campaign Name']}`);
            console.log(`  Channel: ${campaign.Channel}`);
            console.log(`  Objective: ${campaign.Objective}`);
            console.log(`  Amount Spent: ${campaign['Amount Spent']}`);
            console.log(`  Reach: ${campaign.Reach}`);
            console.log(`  Impressions: ${campaign.Impressions}`);
            console.log(`  Clicks: ${campaign.Clicks}`);
            console.log(`  Leads: ${campaign.Leads}`);
            console.log(`  Total User: ${campaign['Total User']}`);
            console.log(`  Session GA4: ${campaign['Session GA4']}`);
            console.log(`  Funnel: ${campaign.Funnels}`);
            console.log(`  Product: ${campaign.Product}`);
        });
    }
    
    // Calculate some aggregated metrics for Frank & Co
    console.log('\n💼 Frank & Co Performance Summary:');
    const { data: frankCampaigns } = await supabase
        .from('campaign_staging')
        .select('*')
        .in('Brand', ['Franknco', 'Frank&co']);
        
    if (frankCampaigns) {
        const totalSpent = frankCampaigns.reduce((sum, c) => sum + parseInt(c['Amount Spent'] || '0'), 0);
        const totalLeads = frankCampaigns.reduce((sum, c) => sum + parseInt(c.Leads || '0'), 0);
        const totalClicks = frankCampaigns.reduce((sum, c) => sum + parseInt(c.Clicks || '0'), 0);
        const totalImpressions = frankCampaigns.reduce((sum, c) => sum + parseInt(c.Impressions || '0'), 0);
        const totalUsers = frankCampaigns.reduce((sum, c) => sum + parseInt(c['Total User'] || '0'), 0);
        
        console.log(`  Total Campaigns: ${frankCampaigns.length}`);
        console.log(`  Total Spent: Rp${totalSpent.toLocaleString()}`);
        console.log(`  Total Leads: ${totalLeads}`);
        console.log(`  Total Clicks: ${totalClicks}`);
        console.log(`  Total Impressions: ${totalImpressions.toLocaleString()}`);
        console.log(`  Total Users: ${totalUsers}`);
        console.log(`  Cost Per Lead: Rp${totalLeads > 0 ? Math.round(totalSpent / totalLeads).toLocaleString() : 'N/A'}`);
        console.log(`  CTR: ${totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(2) : 'N/A'}%`);
        
        // Channel breakdown
        const channelBreakdown = {};
        frankCampaigns.forEach(c => {
            const channel = c.Channel || 'Unknown';
            channelBreakdown[channel] = (channelBreakdown[channel] || 0) + parseInt(c['Amount Spent'] || '0');
        });
        console.log('\n  Spend by Channel:');
        Object.entries(channelBreakdown).forEach(([channel, spend]) => {
            console.log(`    ${channel}: Rp${spend.toLocaleString()}`);
        });
    }
}

getDetailedAnalysis();