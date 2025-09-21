import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

// Read environment variables from .env.local
let supabaseUrl, supabaseAnonKey;
try {
    const envContent = readFileSync('.env.local', 'utf8');
    const envLines = envContent.split('\n');
    for (const line of envLines) {
        if (line.startsWith('VITE_SUPABASE_URL=')) {
            supabaseUrl = line.split('=')[1].replace(/['"]/g, '');
        } else if (line.startsWith('VITE_SUPABASE_ANON_KEY=')) {
            supabaseAnonKey = line.split('=')[1].replace(/['"]/g, '');
        }
    }
} catch (error) {
    console.error('Error reading .env.local file:', error);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testBrandQueries() {
    console.log('🧪 Testing brand queries...\n');
    
    const brands = ['ThePalace', 'Franknco', 'Mondial'];
    
    for (const brand of brands) {
        console.log(`🔍 Querying ${brand}...`);
        
        const { data, error } = await supabase
            .from('campaign_staging')
            .select('*')
            .eq('Brand', brand)
            .limit(5);
            
        if (error) {
            console.error(`❌ Error for ${brand}:`, error);
        } else {
            console.log(`✅ Found ${data.length} campaigns for ${brand}`);
            if (data.length > 0) {
                console.log(`   First campaign: ${data[0]['Campaign Name']}`);
            }
        }
        console.log('');
    }
}

testBrandQueries();