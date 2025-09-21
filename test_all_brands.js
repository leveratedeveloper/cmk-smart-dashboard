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

async function getAllBrands() {
    console.log('🔍 Finding all unique brands in campaign_staging...\n');
    
    const { data, error } = await supabase
        .from('campaign_staging')
        .select('Brand')
        .not('Brand', 'is', null);
        
    if (error) {
        console.error('❌ Error:', error);
        return;
    }
    
    // Get unique brands
    const uniqueBrands = [...new Set(data.map(row => row.Brand))];
    console.log('📊 Found brands:', uniqueBrands);
    
    // Test each brand
    for (const brand of uniqueBrands) {
        const { data: campaigns, error: brandError } = await supabase
            .from('campaign_staging')
            .select('*')
            .eq('Brand', brand)
            .limit(3);
            
        if (brandError) {
            console.error(`❌ Error for ${brand}:`, brandError);
        } else {
            console.log(`✅ ${brand}: ${campaigns.length} campaigns found`);
            if (campaigns.length > 0) {
                console.log(`   Sample: ${campaigns[0]['Campaign Name']}`);
            }
        }
    }
}

getAllBrands();