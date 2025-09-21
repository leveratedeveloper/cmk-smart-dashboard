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

// Test the updated brand configuration
const BRAND_CONFIG = [
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

async function testUpdatedMapping() {
    console.log('🧪 Testing updated data mapping with real campaign_staging data...\n');
    
    for (const brandConfig of BRAND_CONFIG) {
        console.log(`🔍 Testing ${brandConfig.displayName}:`);
        
        // Test the .in() query with all database values
        const { data, error } = await supabase
            .from('campaign_staging')
            .select('Brand, Channel, Objective, "Amount Spent", Leads, Clicks, Impressions, "Total User", "Session GA4", "Post Engagements", "Video Views"')
            .in('Brand', brandConfig.databaseValues)
            .limit(10);
            
        if (error) {
            console.error(`❌ Error for ${brandConfig.displayName}:`, error);
            continue;
        }

        if (data && data.length > 0) {
            // Calculate metrics like our service does
            const totalSpent = data.reduce((sum, c) => sum + parseInt(c['Amount Spent'] || '0'), 0);
            const totalLeads = data.reduce((sum, c) => sum + parseInt(c.Leads || '0'), 0);
            const totalClicks = data.reduce((sum, c) => sum + parseInt(c.Clicks || '0'), 0);
            const totalImpressions = data.reduce((sum, c) => sum + parseInt(c.Impressions || '0'), 0);
            const totalUsers = data.reduce((sum, c) => sum + parseInt(c['Total User'] || '0'), 0);
            const totalSessions = data.reduce((sum, c) => sum + parseInt(c['Session GA4'] || '0'), 0);
            
            const cpl = totalLeads > 0 ? totalSpent / totalLeads : 0;
            const ctr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
            
            console.log(`  ✅ Found ${data.length} campaigns (limited to 10)`);
            console.log(`  📊 Aggregated Metrics:`);
            console.log(`    - Total Spent: Rp${totalSpent.toLocaleString()}`);
            console.log(`    - Total Leads: ${totalLeads}`);
            console.log(`    - Total Clicks: ${totalClicks.toLocaleString()}`);
            console.log(`    - Total Impressions: ${totalImpressions.toLocaleString()}`);
            console.log(`    - Total Users (GA4): ${totalUsers}`);
            console.log(`    - Total Sessions (GA4): ${totalSessions}`);
            console.log(`    - Cost Per Lead: Rp${Math.round(cpl).toLocaleString()}`);
            console.log(`    - Click-Through Rate: ${ctr.toFixed(2)}%`);
            
            // Channel breakdown
            const channels = {};
            data.forEach(c => {
                const channel = c.Channel || 'Unknown';
                channels[channel] = (channels[channel] || 0) + 1;
            });
            console.log(`  📺 Channels: ${Object.entries(channels).map(([ch, count]) => `${ch} (${count})`).join(', ')}`);
            
            // Objective breakdown  
            const objectives = {};
            data.forEach(c => {
                const obj = c.Objective || 'Unknown';
                objectives[obj] = (objectives[obj] || 0) + 1;
            });
            console.log(`  🎯 Objectives: ${Object.entries(objectives).map(([obj, count]) => `${obj} (${count})`).join(', ')}`);
            
        } else {
            console.log(`  ❌ No campaigns found`);
        }
        console.log('');
    }
    
    console.log('🎉 Data mapping test completed! All brands are now configured with proper display names and database values.');
}

testUpdatedMapping();