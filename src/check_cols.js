
const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://zerrhzpoxkbpycttlhgv.supabase.co';
const supabaseAnonKey = 'sb_publishable_u3_FUuz3jiZAEYOynqOb1A_fg3OOmdP';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function inspect() {
    const { data, error } = await supabase.from('medical_products').select('*').limit(1);
    if (error) console.error(error);
    console.log('Columns:', Object.keys(data[0]));
}
inspect();
