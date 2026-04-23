import { supabase } from '../lib/supabase';
import { Food, MedicalProduct } from '../types/database';

export const foodService = {
  /**
   * Tüm doğal gıdaları listeler
   */
  async getFoods(): Promise<Food[]> {
    const { data, error } = await supabase
      .from('foods')
      .select('*')
      .order('food_name', { ascending: true });

    if (error) {
      console.error('getFoods Error:', error);
      throw error;
    }
    return data || [];
  },

  /**
   * İsmine göre doğal gıda arar
   */
  async searchFoods(searchQuery: string): Promise<Food[]> {
    const { data, error } = await supabase
      .from('foods')
      .select('*')
      .ilike('food_name', `%${searchQuery}%`)
      .order('food_name', { ascending: true });

    if (error) {
      console.error('searchFoods Error:', error);
      throw error;
    }
    return data || [];
  },

  /**
   * ID'ye göre tekil doğal gıda getirir
   */
  async getFoodById(id: number): Promise<Food | null> {
    const { data, error } = await supabase
      .from('foods')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      console.error('getFoodById Error:', error);
      throw error;
    }
    return data;
  },

  /**
   * Tüm tıbbi ürünleri/mamaları listeler
   */
  async getMedicalProducts(): Promise<MedicalProduct[]> {
    const { data, error } = await supabase
      .from('medical_products')
      .select('*')
      .order('product_name', { ascending: true });

    if (error) {
      console.error('getMedicalProducts Error:', error);
      throw error;
    }
    return data || [];
  },

  /**
   * İsmine göre tıbbi ürün arar
   */
  async searchMedicalProducts(searchQuery: string): Promise<MedicalProduct[]> {
    const { data, error } = await supabase
      .from('medical_products')
      .select('*')
      .or(`product_name.ilike.%${searchQuery}%,brand.ilike.%${searchQuery}%`)
      .order('product_name', { ascending: true });

    if (error) {
      console.error('searchMedicalProducts Error:', error);
      throw error;
    }
    return data || [];
  },

  /**
   * ID'ye göre tekil tıbbi ürün/mama getirir
   */
  async getMedicalProductById(id: number): Promise<MedicalProduct | null> {
    const { data, error } = await supabase
      .from('medical_products')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      console.error('getMedicalProductById Error:', error);
      throw error;
    }
    return data;
  },

  /**
   * Yeni doğal gıda ekler
   */
  async createFood(food: Omit<Food, 'id'>): Promise<Food> {
    const { data, error } = await supabase
      .from('foods')
      .insert([food])
      .select()
      .single();

    if (error) {
      console.error('createFood Error:', error);
      throw error;
    }
    return data;
  },

  /**
   * Yeni tıbbi ürün/mama ekler
   */
  async createMedicalProduct(product: Omit<MedicalProduct, 'id'>): Promise<MedicalProduct> {
    const { data, error } = await supabase
      .from('medical_products')
      .insert([product])
      .select()
      .single();

    if (error) {
      console.error('createMedicalProduct Error:', error);
      throw error;
    }
    return data;
  }
};
