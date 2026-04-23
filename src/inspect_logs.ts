
import { supabase } from './lib/supabase';

async function inspectLogs() {
  const { data: logs, error } = await supabase.from('user_logs').select('*').limit(5);
  console.log('User Logs Sample:', JSON.stringify(logs, null, 2));
}

inspectLogs();
