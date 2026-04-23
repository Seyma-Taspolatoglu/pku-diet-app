
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://zerrhzpoxkbpycttlhgv.supabase.co';
const supabaseAnonKey = 'sb_publishable_u3_FUuz3jiZAEYOynqOb1A_fg3OOmdP';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function inspect() {
    console.log('Fetching logs...');
    const { data: logs, error } = await supabase.from('user_logs').select('*').limit(3);
    if (error) {
        console.error('Error:', error);
        return;
    }
    console.log('Logs:', JSON.stringify(logs, null, 2));
}

inspect();
