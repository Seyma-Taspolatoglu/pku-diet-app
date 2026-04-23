import { supabase } from '../lib/supabase';
import { UserLog } from '../types/database';

export const userLogService = {
  /**
   * Yeni bir günlük besin veya mama kaydı oluşturur
   * @param log Eklenecek kayıt tablosu verileri
   */
  async createUserLog(log: Omit<UserLog, 'id' | 'created_at'>): Promise<UserLog> {
    const { data, error } = await supabase
      .from('user_logs')
      .insert([
        {
          user_id: log.user_id,
          food_id: log.food_id || null, // Sadece biri dolu olacağı için null kontrolleri
          medical_product_id: log.medical_product_id || null,
          gram_amount: log.gram_amount,
          total_phe: log.total_phe,
          total_protein_eq: log.total_protein_eq,
          log_date: log.log_date || new Date().toISOString().split('T')[0], // YYYY-MM-DD
          meal_type: log.meal_type,
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('createUserLog Error:', error);
      throw error;
    }

    return data;
  },

  /**
   * Belirli bir tarihteki kullanıcının tükettiği her şeyi getirir.
   * Tarih belirtilmezse bugünün kayıtlarını çeker.
   */
  async getDailyLogs(userId: string, targetDate?: string): Promise<UserLog[]> {
    const dateQuery = targetDate || new Date().toISOString().split('T')[0];

    const { data: logs, error: logsError } = await supabase
      .from('user_logs')
      .select('*')
      .eq('user_id', userId)
      .eq('log_date', dateQuery)
      .order('created_at', { ascending: false });

    if (logsError) {
      console.error('getDailyLogs Error:', logsError);
      throw logsError;
    }

    if (!logs || logs.length === 0) return [];

    const foodIds = logs.filter(l => l.food_id).map(l => l.food_id);
    const medicalIds = logs.filter(l => l.medical_product_id).map(l => l.medical_product_id);

    const [foodsResult, medicalsResult] = await Promise.all([
      foodIds.length > 0 ? supabase.from('foods').select('*').in('id', foodIds) : Promise.resolve({ data: [] }),
      medicalIds.length > 0 ? supabase.from('medical_products').select('*').in('id', medicalIds) : Promise.resolve({ data: [] })
    ]);

    // Daha güvenli mapleme için ID'leri string'e zorluyoruz
    const foodsMap = (foodsResult.data || []).reduce((acc: any, f: any) => {
      acc[f.id.toString()] = f;
      return acc;
    }, {});
    
    const medicalsMap = (medicalsResult.data || []).reduce((acc: any, m: any) => {
      acc[m.id.toString()] = m;
      return acc;
    }, {});

    return logs.map(log => ({
      ...log,
      food: log.food_id ? foodsMap[log.food_id.toString()] : undefined,
      medical_product: log.medical_product_id ? medicalsMap[log.medical_product_id.toString()] : undefined,
    }));
  },

  /**
   * Herhangi bir kaydı silmek için kullanılır
   */
  async deleteUserLog(logId: string): Promise<void> {
    const { error } = await supabase
      .from('user_logs')
      .delete()
      .eq('id', logId);

    if (error) {
      console.error('deleteUserLog Error:', error);
      throw error;
    }
  }
};
