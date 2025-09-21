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

// Test the new brand configuration
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
  }
];

async function testBrandConfig() {
    console.log('🧪 Testing new brand configuration...\n');
    
    for (const brandConfig of BRAND_CONFIG) {
        console.log(`🔍 Testing ${brandConfig.displayName} (${brandConfig.id}):`);
        console.log(`   Database values: [${brandConfig.databaseValues.join(', ')}]`);
        
        // Test the new .in() query approach
        const { data, error } = await supabase
            .from('campaign_staging')
            .select('Brand, "Campaign Name"')
            .in('Brand', brandConfig.databaseValues)
            .limit(5);
            
        if (error) {
            console.error(`❌ Error for ${brandConfig.displayName}:`, error);
        } else {
            console.log(`✅ Found ${data.length} campaigns`);
            
            // Show breakdown by database value
            const breakdown = {};
            data.forEach(row => {
                breakdown[row.Brand] = (breakdown[row.Brand] || 0) + 1;
            });
            
            Object.entries(breakdown).forEach(([dbValue, count]) => {
                console.log(`   - ${dbValue}: ${count} campaigns`);
            });
            
            if (data.length > 0) {
                console.log(`   Sample: ${data[0]['Campaign Name']}`);
            }
        }
        console.log('');
    }
}

testBrandConfig();