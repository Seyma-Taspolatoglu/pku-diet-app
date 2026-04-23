
const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://zerrhzpoxkbpycttlhgv.supabase.co';
const supabaseAnonKey = 'sb_publishable_u3_FUuz3jiZAEYOynqOb1A_fg3OOmdP';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function inspect() {
    console.log('Finding a medical log...');
    const { data: logs, error } = await supabase
        .from('user_logs')
        .select('*')
        .not('medical_product_id', 'is', null)
        .limit(1);
    
    if (error) {
        console.error('Logs Error:', error);
        return;
    }
    
    if (!logs || logs.length === 0) {
        console.log('No medical logs found in DB!');
        return;
    }
    
    const log = logs[0];
    console.log('Found Log:', JSON.stringify(log, null, 2));
    
    console.log('Fetching the medical product with ID:', log.medical_product_id);
    const { data: product, error: pError } = await supabase
        .from('medical_products')
        .select('*')
        .eq('id', log.medical_product_id)
        .single();
        
    if (pError) {
        console.log('Product Fetch Error:', pError);
    } else {
        console.log('Matched Product:', JSON.stringify(product, null, 2));
    }
}
inspect();
