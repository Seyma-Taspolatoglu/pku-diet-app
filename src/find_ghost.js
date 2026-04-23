
const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://zerrhzpoxkbpycttlhgv.supabase.co';
const supabaseAnonKey = 'sb_publishable_u3_FUuz3jiZAEYOynqOb1A_fg3OOmdP';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function findGhostProduct() {
    console.log('Finding products with empty names...');
    const { data: emptyFoods } = await supabase
        .from('foods')
        .select('id, food_name')
        .or('food_name.eq.,food_name.is.null');
    
    console.log('Empty Name Foods:', emptyFoods);

    console.log('\nChecking products around "Zeytin"...');
    // Get all foods sorted to see what's after Zeytin
    const { data: allFoods } = await supabase
        .from('foods')
        .select('id, food_name')
        .order('food_name', { ascending: true });
    
    if (allFoods) {
        const zIndex = allFoods.findIndex(f => f.food_name && f.food_name.includes('Zeytin'));
        if (zIndex !== -1) {
            console.log('Zeytin found at index:', zIndex);
            console.log('Context:', allFoods.slice(Math.max(0, zIndex - 2), zIndex + 5));
        }
    }
}
findGhostProduct();
