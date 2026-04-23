
import { supabase } from './src/lib/supabase';

async function checkData() {
  const { data: medical, error } = await supabase.from('medical_products').select('*');
  console.log('Medical Products:', medical);
  const { data: foods, error: error2 } = await supabase.from('foods').select('*');
  console.log('Foods:', foods);
}

checkData();
