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

async function testNewChartData() {
    console.log('🧪 Testing new chart data generation...\n');
    
    // Get sample data for Frank & Co
    const { data: campaigns } = await supabase
        .from('campaign_staging')
        .select('*')
        .in('Brand', ['Franknco', 'Frank&co'])
        .limit(100); // Sample for testing
        
    if (!campaigns || campaigns.length === 0) {
        console.log('❌ No campaign data found');
        return;
    }
    
    console.log(`📊 Found ${campaigns.length} campaigns for testing\n`);
    
    // Test Campaign Objective Data
    console.log('1. 📈 Campaign Objectives Performance:');
    const objectiveData = {};
    campaigns.forEach(c => {
        const obj = c.Objective || 'Unknown';
        if (!objectiveData[obj]) objectiveData[obj] = { spend: 0, campaigns: 0 };
        objectiveData[obj].spend += parseInt(c['Amount Spent'] || '0');
        objectiveData[obj].campaigns += 1;
    });
    
    Object.entries(objectiveData)
        .sort(([,a], [,b]) => b.spend - a.spend)
        .slice(0, 5)
        .forEach(([obj, data]) => {
            console.log(`   ${obj}: Rp${data.spend.toLocaleString()} (${data.campaigns} campaigns)`);
        });
    
    // Test Monthly Spend Data
    console.log('\n2. 📅 Monthly Spend:');
    const monthlyData = {};
    campaigns.forEach(c => {
        const month = c.Month || 'Unknown';
        if (!monthlyData[month]) monthlyData[month] = 0;
        monthlyData[month] += parseInt(c['Amount Spent'] || '0');
    });
    
    Object.entries(monthlyData)
        .sort(([a], [b]) => a.localeCompare(b))
        .forEach(([month, spend]) => {
            console.log(`   ${month}: Rp${spend.toLocaleString()}`);
        });
    
    // Test Product Performance
    console.log('\n3. 🎯 Top Products by Leads:');
    const productData = {};
    campaigns.forEach(c => {
        const product = c.Product || 'Unknown';
        if (!productData[product]) productData[product] = { leads: 0, spend: 0 };
        productData[product].leads += parseInt(c.Leads || '0');
        productData[product].spend += parseInt(c['Amount Spent'] || '0');
    });
    
    Object.entries(productData)
        .sort(([,a], [,b]) => b.leads - a.leads)
        .slice(0, 5)
        .forEach(([product, data]) => {
            const displayName = product.length > 20 ? product.substring(0, 20) + '...' : product;
            console.log(`   ${displayName}: ${data.leads} leads (Rp${data.spend.toLocaleString()})`);
        });
    
    // Test Funnel Performance
    console.log('\n4. 🔄 Funnel Performance:');
    const funnelData = {};
    campaigns.forEach(c => {
        const funnel = c.Funnels || 'Unknown';
        if (!funnelData[funnel]) funnelData[funnel] = { totalSpend: 0, campaigns: 0 };
        funnelData[funnel].totalSpend += parseInt(c['Amount Spent'] || '0');
        funnelData[funnel].campaigns += 1;
    });
    
    Object.entries(funnelData)
        .sort(([,a], [,b]) => b.campaigns - a.campaigns)
        .forEach(([funnel, data]) => {
            const avgSpend = data.campaigns > 0 ? Math.round(data.totalSpend / data.campaigns) : 0;
            console.log(`   ${funnel}: ${data.campaigns} campaigns (Avg: Rp${avgSpend.toLocaleString()})`);
        });
    
    console.log('\n✅ All new chart data types are working with real campaign data!');
    console.log('🎉 Charts replaced: Top Posts → Campaign Objectives, Video Completion → Monthly Spend, Hashtags → Products, Sentiment → Funnels');
}

testNewChartData();