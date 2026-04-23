
const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://zerrhzpoxkbpycttlhgv.supabase.co';
const supabaseAnonKey = 'sb_publishable_u3_FUuz3jiZAEYOynqOb1A_fg3OOmdP';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function inspect() {
    const { data, error } = await supabase.from('user_logs').select('*').limit(1);
    if (data && data.length > 0) {
        console.log('User logs row keys:', Object.keys(data[0]));
        // Try to see if there are logs with medical products
        const { data: mLogs } = await supabase.from('user_logs').select('*').not('medical_product_id', 'is', null).limit(1);
        console.log('Has medical logs:', mLogs && mLogs.length > 0);
    }
}
inspect();
