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

async function analyzeDataStructure() {
    console.log('🔍 Analyzing campaign_staging table structure and data...\n');
    
    // Get a sample of campaigns to understand the data structure
    const { data: sample, error } = await supabase
        .from('campaign_staging')
        .select('*')
        .limit(3);
        
    if (error) {
        console.error('❌ Error:', error);
        return;
    }
    
    if (sample && sample.length > 0) {
        console.log('📊 Sample campaign data structure:');
        console.log('Columns available:');
        Object.keys(sample[0]).forEach(key => {
            const value = sample[0][key];
            const type = typeof value;
            const sampleValue = value ? String(value).substring(0, 50) : 'null';
            console.log(`  - ${key}: ${type} (example: "${sampleValue}")`);
        });
        
        console.log('\n📈 Analyzing numeric fields for metrics:');
        const numericFields = [];
        Object.keys(sample[0]).forEach(key => {
            const value = sample[0][key];
            if (value && !isNaN(parseFloat(value))) {
                numericFields.push(key);
                console.log(`  ✓ ${key}: ${value}`);
            }
        });
        
        console.log('\n🎯 Platform/Channel analysis:');
        const { data: platforms } = await supabase
            .from('campaign_staging')
            .select('Platform')
            .not('Platform', 'is', null);
            
        if (platforms) {
            const uniquePlatforms = [...new Set(platforms.map(p => p.Platform))];
            console.log('Available platforms:', uniquePlatforms);
        }
        
        console.log('\n💰 Campaign objective analysis:');
        const { data: objectives } = await supabase
            .from('campaign_staging')
            .select('Objective')
            .not('Objective', 'is', null);
            
        if (objectives) {
            const uniqueObjectives = [...new Set(objectives.map(o => o.Objective))];
            console.log('Available objectives:', uniqueObjectives);
        }
        
        console.log('\n📅 Date range analysis:');
        const { data: dates } = await supabase
            .from('campaign_staging')
            .select('"Start Date", "End Date"')
            .not('"Start Date"', 'is', null)
            .limit(5);
            
        if (dates && dates.length > 0) {
            console.log('Date format examples:');
            dates.forEach((d, i) => {
                console.log(`  ${i+1}. Start: ${d['Start Date']}, End: ${d['End Date']}`);
            });
        }
        
        console.log('\n💵 Budget and performance analysis:');
        const { data: performance } = await supabase
            .from('campaign_staging')
            .select('Budget, Spend, Revenue, Conversions, Impressions, Clicks, "Click-Through Rate", "Conversion Rate", ROAS, "Cost Per Lead", "Cost Per Conversion"')
            .limit(5);
            
        if (performance && performance.length > 0) {
            console.log('Performance metrics examples:');
            performance.forEach((p, i) => {
                console.log(`  Campaign ${i+1}:`);
                Object.entries(p).forEach(([key, value]) => {
                    if (value !== null) {
                        console.log(`    ${key}: ${value}`);
                    }
                });
                console.log('');
            });
        }
    }
}

analyzeDataStructure();