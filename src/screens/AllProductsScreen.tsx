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
import { useNavigation } from '@react-navigation/native';
import { foodService } from '../services/foodService';
import { Food, MedicalProduct } from '../types/database';

type TabType = 'foods' | 'medical';

export default function AllProductsScreen() {
  const navigation = useNavigation<any>();

  // States
  const [foods, setFoods] = useState<Food[]>([]);
  const [medicalProducts, setMedicalProducts] = useState<MedicalProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('foods');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch Data on Mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Parallel fetching for performance
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

  // Filter Active Data
  const filteredData = useMemo(() => {
    const query = searchQuery.toLowerCase();
    
    if (activeTab === 'foods') {
      return foods.filter(item => 
        (item.food_name || '').toLowerCase().includes(query)
      );
    } else {
      return medicalProducts.filter(item => 
        (item.product_name || '').toLowerCase().includes(query) || 
        (item.brand && item.brand.toLowerCase().includes(query))
      );
    }
  }, [foods, medicalProducts, activeTab, searchQuery]);

  // Handle Item Press
  const handleItemPress = (id: number, type: TabType) => {
    // FoodDetails ekranına yönlendirme
    navigation.navigate('FoodDetails', { id, type });
  };

  // Render FlatList Item
  const renderItem = ({ item }: { item: any }) => {
    if (activeTab === 'foods') {
      const food = item as Food;
      return (
        <TouchableOpacity 
          style={styles.card} 
          activeOpacity={0.7}
          onPress={() => handleItemPress(food.id, 'foods')}
        >
          <View style={styles.cardHeader}>
            <Text style={styles.productName}>{food.food_name}</Text>
          </View>
          <View style={styles.cardBody}>
            <View style={styles.infoBox}>
              <Text style={styles.infoLabel}>Protein</Text>
              <Text style={styles.infoValue}>{food.protein_per_100g || 0}g / 100g</Text>
            </View>
            <View style={styles.infoBox}>
              <Text style={styles.infoLabel}>Phe Değeri</Text>
              <Text style={styles.infoPhe}>{food.phe_per_1g_protein || 0} mg</Text>
            </View>
          </View>
        </TouchableOpacity>
      );
    } else {
      const medical = item as MedicalProduct;
      return (
        <TouchableOpacity 
          style={styles.card} 
          activeOpacity={0.7}
          onPress={() => handleItemPress(medical.id, 'medical')}
        >
          <View style={styles.cardHeader}>
            <Text style={styles.productName}>{medical.product_name}</Text>
            {medical.brand && <Text style={styles.brandName}>{medical.brand}</Text>}
          </View>
          <View style={styles.cardBody}>
            <View style={styles.infoBox}>
              <Text style={styles.infoLabel}>Protein Eşdeğeri (PE)</Text>
              <Text style={styles.infoValue}>{medical.protein_equivalent_pe || 0}g</Text>
            </View>
            {medical.tyrosine_per_100 !== undefined && (
              <View style={styles.infoBox}>
                <Text style={styles.infoLabel}>Tirozin</Text>
                <Text style={styles.infoValue}>{medical.tyrosine_per_100}g / 100g</Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
      );
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        



        {/* Tab Menu */}
        <View style={styles.tabContainer}>
          <TouchableOpacity 
            style={[styles.tabButton, activeTab === 'foods' && styles.tabButtonActive]}
            onPress={() => setActiveTab('foods')}
          >
            <Text style={[styles.tabText, activeTab === 'foods' && styles.tabTextActive]}>
              Doğal Gıdalar
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.tabButton, activeTab === 'medical' && styles.tabButtonActive]}
            onPress={() => setActiveTab('medical')}
          >
            <Text style={[styles.tabText, activeTab === 'medical' && styles.tabTextActive]}>
              Tıbbi Ürünler
            </Text>
          </TouchableOpacity>
        </View>

        {/* List Details / Loading */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#8E0054" />
            <Text style={styles.loadingText}>Ürünler Yükleniyor...</Text>
          </View>
        ) : (
          <FlatList
            data={filteredData}
            keyExtractor={(item, index) => `${activeTab}-${item.id || index}`}
            renderItem={renderItem}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
            // Performance Optimizations
            initialNumToRender={10}
            maxToRenderPerBatch={10}
            windowSize={5}
            removeClippedSubviews={true}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="nutrition-outline" size={48} color="#BDBDBD" />
                <Text style={styles.emptyText}>Aradığınız kriterlere uygun ürün bulunamadı.</Text>
              </View>
            }
          />
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
    paddingHorizontal: 16,
    paddingTop: 10,
  },

  // Tab Menu
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.indigoLight,
    borderRadius: 12,
    padding: 6,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  tabButtonActive: {
    backgroundColor: COLORS.white,
    shadowColor: COLORS.indigo,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#888888',
  },
  tabTextActive: {
    color: COLORS.indigo,
  },

  // Loading & Empty state
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: COLORS.indigo,
    fontSize: 16,
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
  },
  emptyText: {
    marginTop: 12,
    color: COLORS.textSecondary,
    fontSize: 15,
    textAlign: 'center',
  },

  // List & Cards
  listContainer: {
    paddingBottom: 20,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: COLORS.indigo,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    borderLeftWidth: 5,
    borderLeftColor: COLORS.indigo,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  productName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    flex: 1,
  },
  brandName: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.white,
    backgroundColor: COLORS.indigo,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    overflow: 'hidden',
  },
  cardBody: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    gap: 20,
  },
  infoBox: {
    alignItems: 'flex-start',
  },
  infoLabel: {
    fontSize: 11,
    color: '#9E9E9E',
    marginBottom: 4,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  infoPhe: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.red, 
  }
});
