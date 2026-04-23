
const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://zerrhzpoxkbpycttlhgv.supabase.co';
const supabaseAnonKey = 'sb_publishable_u3_FUuz3jiZAEYOynqOb1A_fg3OOmdP';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkPK() {
    // We can't run raw SQL easily, but we can try to guess or use the data
    const { data, error } = await supabase.from('medical_products').select('*').limit(1);
    if (data && data.length > 0) {
        console.log('Sample data keys:', Object.keys(data[0]));
    }
}

// I'll try to find the PK using a specific RPC if possible, 
// but since I don't have it, I'll try to check if 'product_name' is unique.
async function checkUnique() {
    const { data, error } = await supabase.from('medical_products').select('product_name');
    const names = data.map(d => d.product_name);
    const uniqueNames = new Set(names);
    console.log('Total:', names.length, 'Unique names:', uniqueNames.size);
    if (names.length === uniqueNames.size) {
        console.log('product_name is likely the PK.');
    }
}
checkUnique();
