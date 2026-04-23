export interface Food {
  id: number;
  food_name: string;
  protein_per_100g?: number;
  phe_per_1g_protein?: number;
  created_at?: string;
}

export interface MedicalProduct {
  id: number;
  brand?: string;
  product_name: string;
  form?: string;
  tyrosine_per_100?: number;
  protein_equivalent_pe?: number;
  notes?: string;
  created_at?: string;
}

export interface UserLog {
  id?: string;
  user_id: string;
  food_id?: number;
  medical_product_id?: number;
  gram_amount: number;
  total_phe: number;
  total_protein_eq: number;
  log_date?: string;
  meal_type?: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack';
  created_at?: string;
  food?: { food_name?: string; protein_per_100g?: number; phe_per_1g_protein?: number };
  medical_product?: { product_name?: string; brand?: string; protein_equivalent_pe?: number; tyrosine_per_100?: number };
}
