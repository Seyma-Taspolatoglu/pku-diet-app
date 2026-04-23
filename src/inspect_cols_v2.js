
const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://zerrhzpoxkbpycttlhgv.supabase.co';
const supabaseAnonKey = 'sb_publishable_u3_FUuz3jiZAEYOynqOb1A_fg3OOmdP';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function inspect() {
    const { data, error } = await supabase.rpc('get_table_schema', { table_name: 'medical_products' });
    if (error) {
        // If RPC doesn't exist, try a direct query to information_schema
        const { data: cols, error: e2 } = await supabase.from('medical_products').select('*').limit(1);
        if (cols && cols.length > 0) {
            console.log('Row keys:', Object.keys(cols[0]));
        }
    } else {
        console.log('RPC Schema:', data);
    }
}
inspect();
