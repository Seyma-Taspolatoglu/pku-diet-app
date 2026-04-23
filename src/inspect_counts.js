
const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://zerrhzpoxkbpycttlhgv.supabase.co';
const supabaseAnonKey = 'sb_publishable_u3_FUuz3jiZAEYOynqOb1A_fg3OOmdP';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function inspect() {
    const foods = await supabase.from('foods').select('count', { count: 'exact', head: true });
    console.log('Food Count:', foods.count, 'Error:', foods.error);
    
    const medical = await supabase.from('medical_products').select('count', { count: 'exact', head: true });
    console.log('Medical Count:', medical.count, 'Error:', medical.error);
}
inspect();
