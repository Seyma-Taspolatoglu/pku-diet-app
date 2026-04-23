
const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://zerrhzpoxkbpycttlhgv.supabase.co';
const supabaseAnonKey = 'sb_publishable_u3_FUuz3jiZAEYOynqOb1A_fg3OOmdP';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function inspect() {
    // Try to find the primary key column name
    const { data: pk, error } = await supabase.rpc('get_table_pk', { table_name: 'medical_products' });
    if (error) {
        console.error('RPC Error:', error);
        // Fallback: try to see if 'id' exists by selecting it explicitly
        const { data: idCheck, error: idError } = await supabase.from('medical_products').select('id').limit(1);
        console.log('Explicit id select error:', idError ? idError.message : 'Success');
    } else {
        console.log('PK:', pk);
    }
}
inspect();
