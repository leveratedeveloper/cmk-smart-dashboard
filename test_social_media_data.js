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

async function testSocialMediaData() {
    console.log('🧪 Testing Social Media Data Generation...\n');
    
    // Test with Frank & Co since it has good social media data
    const { data: campaigns } = await supabase
        .from('campaign_staging')
        .select('*')
        .in('Brand', ['Franknco', 'Frank&co'])
        .in('Channel', ['Meta', 'Tiktok']);
        
    console.log(`📊 Found ${campaigns?.length || 0} social media campaigns for Frank & Co`);
    
    if (campaigns && campaigns.length > 0) {
        // Test social media metrics calculation
        const totalEngagements = campaigns.reduce((sum, c) => sum + parseInt(c['Post Engagements'] || '0'), 0);
        const totalVideoViews = campaigns.reduce((sum, c) => sum + parseInt(c['Video Views'] || '0'), 0);
        const totalSpent = campaigns.reduce((sum, c) => sum + parseInt(c['Amount Spent'] || '0'), 0);
        const totalImpressions = campaigns.reduce((sum, c) => sum + parseInt(c.Impressions || '0'), 0);
        
        const metaCampaigns = campaigns.filter(c => c.Channel === 'Meta');
        const tiktokCampaigns = campaigns.filter(c => c.Channel === 'Tiktok');
        
        console.log('📈 Social Media Content Performance:');
        console.log(`  Total Engagements: ${totalEngagements.toLocaleString()}`);
        console.log(`  Total Video Views: ${totalVideoViews.toLocaleString()}`);
        console.log(`  Engagement Rate: ${totalImpressions > 0 ? ((totalEngagements / totalImpressions) * 100).toFixed(2) : 0}%`);
        console.log(`  Cost Per Engagement: Rp${totalEngagements > 0 ? Math.round(totalSpent / totalEngagements).toLocaleString() : 0}`);
        
        console.log('\n🏆 Social Media Competition (Platform Comparison):');
        console.log(`  Meta Campaigns: ${metaCampaigns.length}`);
        console.log(`  TikTok Campaigns: ${tiktokCampaigns.length}`);
        console.log(`  Meta Spend: Rp${metaCampaigns.reduce((sum, c) => sum + parseInt(c['Amount Spent'] || '0'), 0).toLocaleString()}`);
        console.log(`  TikTok Spend: Rp${tiktokCampaigns.reduce((sum, c) => sum + parseInt(c['Amount Spent'] || '0'), 0).toLocaleString()}`);
        
        console.log('\n🎥 Content Type Analysis:');
        const videoCampaigns = campaigns.filter(c => parseInt(c['Video Views'] || '0') > 0);
        const imageCampaigns = campaigns.filter(c => parseInt(c['Video Views'] || '0') === 0);
        console.log(`  Video Campaigns: ${videoCampaigns.length}`);
        console.log(`  Image/Static Campaigns: ${imageCampaigns.length}`);
        
        console.log('\n✅ Social Media sections should now show real data!');
    } else {
        console.log('❌ No social media campaigns found');
    }
}

testSocialMediaData();