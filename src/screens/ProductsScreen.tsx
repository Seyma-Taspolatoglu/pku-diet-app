import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  StatusBar,
  FlatList,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { foodService } from '../services/foodService';
import { userLogService } from '../services/userLogService';
import { useAuth } from '../context/AuthContext';
import { Food, MedicalProduct } from '../types/database';

export default function ProductsScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const mealId = route.params?.mealId;
  const targetDate = route.params?.date;
  const { user } = useAuth();

  // States
  const [foods, setFoods] = useState<Food[]>([]);
  const [medicalProducts, setMedicalProducts] = useState<MedicalProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProducts, setSelectedProducts] = useState<Record<string, { item: any, grams: string }>>({});
  const [activeTab, setActiveTab] = useState<'food' | 'medical'>('food');

  // Fetch Data on Mount
  useEffect(() => {
    loadData();
  }, []);

  // Sayfadan ayrıldığımızda veya parametreler değiştiğinde durumu temizle
  useEffect(() => {
    const unsubscribe = navigation.addListener('blur', () => {
      setSelectedProducts({});
      // Eğer navigasyon objesi destekliyorsa parametreleri de temizle
      if (navigation.setParams) {
        navigation.setParams({ mealId: undefined });
      }
    });

    return unsubscribe;
  }, [navigation]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [foodsData, medicalData] = await Promise.all([
        foodService.getFoods(),
        foodService.getMedicalProducts()
      ]);
      setFoods(foodsData);
      setMedicalProducts(medicalData);
    } catch (error) {
      console.error('Veri çekilirken hata oluştu:', error);
    } finally {
      setLoading(false);
    }
  };

  // Merge and Filter Active Data
  const filteredData = useMemo(() => {
    const query = searchQuery.toLowerCase();

    // Map foods to a unified structure
    const mappedFoods = foods.map(f => ({
      ...f,
      unified_type: 'food',
      unified_name: f.food_name || '',
    }));

    // Map medical products to a unified structure
    const mappedMedicals = medicalProducts.map(m => ({
      ...m,
      unified_type: 'medical',
      unified_name: m.product_name || '',
    }));

    // mealId yoksa (genel liste) her şeyi göster, varsa sekmeye göre filtrele
    const combined = mealId 
      ? (activeTab === 'food' ? mappedFoods : mappedMedicals)
      : [...mappedFoods, ...mappedMedicals];
    
    // Eğer sekmeler değişirse ve arama yoksa, o sekmeye ait tüm ürünleri getir
    if (!query) {
      return mealId ? combined : [];
    }

    return combined.filter(item => {
      const matchName = item.unified_name.toLowerCase().includes(query);
      if (item.unified_type === 'medical') {
        const matchBrand = (item as any).brand
          ? (item as any).brand.toLowerCase().includes(query)
          : false;
        return matchName || matchBrand;
      }
      return matchName;
    });
  }, [foods, medicalProducts, searchQuery, mealId, activeTab]);

  // Selection helpers
  const toggleProduct = (itemId: string, item: any) => {
    setSelectedProducts(prev => {
      const newSel = { ...prev };
      if (newSel[itemId]) {
        delete newSel[itemId];
      } else {
        newSel[itemId] = { item, grams: '' };
      }
      return newSel;
    });
  };

  const updateGrams = (itemId: string, grams: string) => {
    setSelectedProducts(prev => {
      const newSel = { ...prev };
      if (newSel[itemId]) {
        newSel[itemId].grams = grams;
      }
      return newSel;
    });
  };

  const saveToMeal = async () => {
    if (!user) return;
    
    let mappedMealType: any = 'Snack';
    if (mealId === 1) mappedMealType = 'Breakfast';
    else if (mealId === 2) mappedMealType = 'Lunch';
    else if (mealId === 3) mappedMealType = 'Dinner';

    const items = Object.values(selectedProducts);
    
    for (const data of items) {
       if (!data.grams || isNaN(parseFloat(data.grams)) || parseFloat(data.grams) <= 0) {
          alert('Lütfen seçili tüm ürünler için geçerli bir gramaj giriniz.');
          return;
       }
    }

    try {
      setLoading(true);
      for (const data of items) {
         const { item, grams } = data;
         const numGrams = parseFloat(grams);
         const isFood = item.unified_type === 'food';
         
         let totalProteinEq = 0;
         let totalPhe = 0;
         
         if (isFood) {
           const proteinPer100 = item.protein_per_100g || 0;
           totalProteinEq = (proteinPer100 / 100) * numGrams;
           const phePer1gProtein = item.phe_per_1g_protein || 0;
           // total_phe veritabanında g cinsinden olabildiği için mg'a çeviriyoruz (* 1000)
           totalPhe = phePer1gProtein * totalProteinEq * 1000; 
         } else {
           const proteinEqPer100 = item.protein_equivalent_pe || 0;
           totalProteinEq = (proteinEqPer100 / 100) * numGrams;
           totalPhe = 0; 
         }
         
         await userLogService.createUserLog({
           user_id: user.id,
           food_id: isFood ? item.id : undefined,
           medical_product_id: !isFood ? item.id : undefined,
           gram_amount: numGrams,
           total_protein_eq: totalProteinEq,
           total_phe: totalPhe,
           log_date: targetDate, 
           meal_type: mappedMealType
         });
      }
      setSelectedProducts({}); // Clear selection after success
      setLoading(false);
      navigation.goBack();
    } catch (e) {
      console.log('Error logging meal', e);
      setLoading(false);
      alert('Kayıt sırasında hata oluştu.');
    }
  };

  const renderItem = ({ item, index }: { item: any, index: number }) => {
    const isFood = item.unified_type === 'food';
    const name = item.unified_name;
    const pd = isFood ? item.protein_per_100g || 0 : item.protein_equivalent_pe || 0;
    // Gıdalar için mg/100g PHE hesapla: (protein/100g) * (phe/1g protein) * 1000
    const phe = isFood 
      ? ((item.protein_per_100g || 0) * (item.phe_per_1g_protein || 0) * 1000).toFixed(0) 
      : '-'; 
    const itemId = `${item.unified_type}-${item.id || index}`;

    if (mealId) {
       const isSelected = !!selectedProducts[itemId];
       return (
        <View style={styles.listItem}>
          <TouchableOpacity onPress={() => toggleProduct(itemId, item)} style={{flexDirection: 'row', alignItems: 'center', flex: 2}}>
             <Ionicons name={isSelected ? "checkbox" : "square-outline"} size={24} color={isSelected ? COLORS.indigo : "#ccc"} style={{marginRight: 10}} />
             <Text style={styles.itemLeft} numberOfLines={2}>{name}</Text>
          </TouchableOpacity>
          <View style={styles.itemCenter}>
            <Text style={styles.itemValueText}>{pd}</Text>
          </View>
          <View style={styles.itemRight}>
            <Text style={[styles.itemValueText, isFood ? styles.pheText : null]}>{phe}</Text>
          </View>
          <View style={styles.itemRight}>
            <Text style={[styles.itemValueText, !isFood ? styles.tyrText : null]}>
              {!isFood ? (item.tyrosine_per_100 || 0) : 0}
            </Text>
          </View>
          <View style={styles.itemRight}>
            {isSelected ? (
               <TextInput 
                 style={styles.gramInput} 
                 placeholder="Gram" 
                 keyboardType="numeric"
                 value={selectedProducts[itemId]?.grams || ''}
                 onChangeText={(val) => updateGrams(itemId, val)}
                 {...Platform.select({ web: { outlineStyle: 'none' } as any })}
               />
            ) : null}
          </View>
        </View>
       );
    }

    return (
      <TouchableOpacity
        style={styles.listItem}
        onPress={() => navigation.navigate('FoodDetails', { id: item.id, type: item.unified_type })}
      >
        <Text style={styles.itemLeft} numberOfLines={1}>{name}</Text>
        <View style={styles.itemCenter}>
          <Text style={styles.itemValueText}>{pd}</Text>
        </View>
        <View style={styles.itemRight}>
          <Text style={[styles.itemValueText, isFood ? styles.pheText : null]}>{phe}</Text>
        </View>
        <View style={styles.itemRight}>
          <Text style={[styles.itemValueText, !isFood ? styles.tyrText : null]}>
            {!isFood ? (item.tyrosine_per_100 || 0) : 0}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>

        {/* Filter Tabs - Sadece öğün ekleme modunda göster */}
        {mealId && (
          <View style={styles.tabsWrapper}>
            <TouchableOpacity 
              style={[styles.tabButton, activeTab === 'food' && styles.tabButtonActive]} 
              onPress={() => setActiveTab('food')}
            >
              <Ionicons name="leaf-outline" size={18} color={activeTab === 'food' ? COLORS.white : COLORS.indigo} />
              <Text style={[styles.tabText, activeTab === 'food' && styles.tabTextActive]}>Gıdalar</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.tabButton, activeTab === 'medical' && styles.tabButtonActive]} 
              onPress={() => setActiveTab('medical')}
            >
              <Ionicons name="medical-outline" size={18} color={activeTab === 'medical' ? COLORS.white : COLORS.indigo} />
              <Text style={[styles.tabText, activeTab === 'medical' && styles.tabTextActive]}>Tıbbi Ürünler</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#888" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Ürün veya besin ara..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#BDBDBD" />
            </TouchableOpacity>
          )}
        </View>

        {/* List Header Table Columns */}
        <View style={styles.listHeaderRow}>
          <Text style={styles.colLeft}>Ürün Adı</Text>

          <View style={styles.colCenter}>
            <Text style={styles.colMainText}>Pd</Text>
            <Text style={styles.colSubText}>(g/100)</Text>
          </View>

          <View style={styles.colRight}>
            <Text style={styles.colMainText}>Fen.</Text>
            <Text style={styles.colSubText}>(mg/100)</Text>
          </View>

          <View style={styles.colRight}>
            <Text style={styles.colMainText}>Tir.</Text>
            <Text style={styles.colSubText}>(g/100)</Text>
          </View>

          {mealId && (
            <View style={styles.colRight}>
              <Text style={styles.colMainText}>Gram</Text>
              <Text style={styles.colSubText}>(g)</Text>
            </View>
          )}
        </View>

        {/* Data List */}
        <View style={styles.listArea}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#90af9aff" />
            </View>
          ) : (
            <FlatList
              data={filteredData}
              keyExtractor={(item, index) => `${item.unified_type}-${item.id || index}`}
              renderItem={renderItem}
              showsVerticalScrollIndicator={false}
              initialNumToRender={15}
              maxToRenderPerBatch={15}
              windowSize={5}
              removeClippedSubviews={true}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Ionicons
                    name={searchQuery ? "alert-circle-outline" : "search-outline"}
                    size={40}
                    color="#ccc"
                  />
                  <Text style={styles.emptyText}>
                    {searchQuery
                      ? "Aradığınız ürün bulunamadı."
                      : "Aramaya başlamak için ürün veya besin adı girin..."}
                  </Text>
                </View>
              }
            />
          )}
        </View>

        {/* Bottom Buttons */}
        {mealId ? (
          Object.keys(selectedProducts).length > 0 && (
            <View style={styles.bottomButtonsContainer}>
              <TouchableOpacity style={styles.primaryButton} onPress={saveToMeal}>
                <Text style={styles.primaryButtonText}>Seçilenleri Ekle ({Object.keys(selectedProducts).length})</Text>
              </TouchableOpacity>
            </View>
          )
        ) : (
          <View style={styles.bottomButtonsContainer}>
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => navigation.push('AllProducts')}
            >
              <Text style={styles.secondaryButtonText}>Tüm Ürünler</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.primaryButton, { marginTop: 10 }]}
              onPress={() => navigation.push('CreateProduct')}
            >
              <Text style={styles.primaryButtonText}>Yeni Ürün Oluştur</Text>
            </TouchableOpacity>
          </View>
        )}

      </View>
    </SafeAreaView>
  );
}

const COLORS = {
  indigo: '#4F46E5',
  indigoLight: '#EEF2FF',
  emerald: '#10B981',
  blue: '#3B82F6',
  white: '#FFFFFF',
  bg: '#FCFDFF',
  text: '#1E1B4B',
  textSecondary: '#6366F1',
  border: '#E0E7FF',
  red: '#EF4444',
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.bg,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  container: {
    flex: 1,
    paddingHorizontal: 15,
    paddingTop: 15,
  },

  // Search Bar
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.indigoLight,
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 52,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  searchIcon: {
    marginRight: 10,
  },
  
  // Tabs Style
  tabsWrapper: {
    flexDirection: 'row',
    backgroundColor: COLORS.indigoLight,
    padding: 4,
    borderRadius: 14,
    marginBottom: 16,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 11,
  },
  tabButtonActive: {
    backgroundColor: COLORS.indigo,
    shadowColor: COLORS.indigo,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.indigo,
    marginLeft: 8,
  },
  tabTextActive: {
    color: COLORS.white,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: COLORS.text,
    height: '100%',
  },

  // Table Header Row
  listHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingBottom: 10,
    marginBottom: 10,
  },
  colLeft: {
    flex: 2,
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  colCenter: {
    flex: 0.7,
    alignItems: 'center',
  },
  colRight: {
    flex: 0.7,
    alignItems: 'center',
  },
  colMainText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  colSubText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
  },

  // List Items
  listArea: {
    flex: 1,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  itemLeft: {
    flex: 2,
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '500',
  },
  itemCenter: {
    flex: 1,
    alignItems: 'center',
  },
  itemRight: {
    flex: 0.7,
    alignItems: 'center',
  },
  tyrText: {
    color: COLORS.blue,
  },
  itemValueText: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '600',
  },
  pheText: {
    color: COLORS.indigo, // Highlight PHE with Indigo
  },
  gramInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: 4,
    paddingVertical: 5,
    width: 60,
    textAlign: 'center',
    fontSize: 13,
    backgroundColor: COLORS.white,
    color: COLORS.text,
  },

  // Loading & Empty state
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    paddingTop: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    marginTop: 10,
    color: COLORS.textSecondary,
    fontSize: 15,
  },

  // Bottom Buttons
  bottomButtonsContainer: {
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  primaryButton: {
    backgroundColor: COLORS.indigo, 
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 10,
    shadowColor: COLORS.indigo,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 16,
  },
  secondaryButton: {
    borderWidth: 1.5,
    borderColor: COLORS.indigo,
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: COLORS.indigo,
    fontWeight: 'bold',
    fontSize: 16,
  },
});
