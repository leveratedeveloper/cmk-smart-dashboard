// Quick test to verify the data flow is working
import { getRealCampaignData } from './data/realCampaignData.js';

console.log('🧪 Testing data connection flow...');

try {
    console.log('🔄 Testing getRealCampaignData function...');
    const testData = await getRealCampaignData('Frank & Co');
    console.log('✅ getRealCampaignData function works!');
    console.log('📊 Sample data structure:', {
        executiveMetrics: testData.executiveMetrics?.length || 0,
        secondaryMetrics: testData.secondaryMetrics?.length || 0,
        topCampaigns: testData.topCampaigns?.length || 0,
        alerts: testData.alerts?.length || 0,
        recommendations: testData.recommendations?.length || 0
    });
} catch (error) {
    console.error('❌ Error testing getRealCampaignData:', error);
}

console.log('🎉 Connection flow test complete!');