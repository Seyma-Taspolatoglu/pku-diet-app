import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
  Platform
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { foodService } from '../services/foodService';
import { Food, MedicalProduct } from '../types/database';

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
  amber: '#F59E0B',
};

export default function FoodDetailsScreen() {
  const navigation = useNavigation();
  const route = useRoute<any>();
  const { id, type } = route.params;

  const [item, setItem] = useState<Food | MedicalProduct | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadItem();
  }, [id, type]);

  const loadItem = async () => {
    setLoading(true);
    try {
      if (type === 'food' || type === 'foods') {
        const data = await foodService.getFoodById(id);
        setItem(data);
      } else {
        const data = await foodService.getMedicalProductById(id);
        setItem(data);
      }
    } catch (error) {
      console.error('Error loading item details:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.indigo} />
        <Text style={styles.loadingText}>Yüklenüyor...</Text>
      </View>
    );
  }

  if (!item) {
    return (
      <View style={styles.errorContainer}>
        <MaterialCommunityIcons name="alert-circle-outline" size={60} color={COLORS.indigo} />
        <Text style={styles.errorText}>Ürün bulunamadı.</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>Geri Dön</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const isFood = type === 'food' || type === 'foods';
  const name = isFood ? (item as Food).food_name : (item as MedicalProduct).product_name;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBack}>
          <MaterialCommunityIcons name="chevron-left" size={32} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>Ürün Detayı</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        
        {/* Product Title Card */}
        <View style={styles.titleCard}>
          <View style={styles.iconContainer}>
            <MaterialCommunityIcons 
              name={isFood ? "food-apple" : "pill"} 
              size={40} 
              color={COLORS.white} 
            />
          </View>
          <Text style={styles.productName}>{name}</Text>
          {!isFood && (item as MedicalProduct).brand && (
            <View style={styles.brandBadge}>
              <Text style={styles.brandText}>{(item as MedicalProduct).brand}</Text>
            </View>
          )}
        </View>

        {/* Nutritional Data Grid */}
        <View style={styles.grid}>
          {/* Protein Card */}
          <View style={styles.dataCard}>
            <MaterialCommunityIcons name="molecule" size={24} color={COLORS.indigo} />
            <Text style={styles.dataLabel}>{isFood ? 'Protein' : 'Protein Eşdeğeri (PE)'}</Text>
            <Text style={styles.dataValue}>
              {isFood ? (item as Food).protein_per_100g : (item as MedicalProduct).protein_equivalent_pe || 0}g
            </Text>
            <Text style={styles.dataUnit}>per 100g</Text>
          </View>

          {/* Phe/Tyrosine Card */}
          <View style={styles.dataCard}>
            <MaterialCommunityIcons 
              name={isFood ? "lightning-bolt" : "heart-pulse"} 
              size={24} 
              color={isFood ? COLORS.amber : COLORS.blue} 
            />
            <Text style={styles.dataLabel}>{isFood ? 'Fenilalanin' : 'Tirozin'}</Text>
            <Text style={[styles.dataValue, { color: isFood ? COLORS.amber : COLORS.blue }]}>
              {isFood ? (item as Food).phe_per_1g_protein || 0 : (item as MedicalProduct).tyrosine_per_100 || 0}
            </Text>
            <Text style={styles.dataUnit}>{isFood ? 'mg / 1g Protein' : 'g / 100g'}</Text>
          </View>
        </View>

        {/* Additional Info Section */}
        {!isFood && ((item as MedicalProduct).form || (item as MedicalProduct).notes) && (
          <View style={styles.infoCard}>
            <View style={styles.cardHeader}>
              <MaterialCommunityIcons name="information-outline" size={20} color={COLORS.indigo} />
              <Text style={styles.cardHeaderTitle}>Ek Bilgiler</Text>
            </View>
            
            {(item as MedicalProduct).form && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Form:</Text>
                <Text style={styles.infoText}>{(item as MedicalProduct).form}</Text>
              </View>
            )}

            {(item as MedicalProduct).notes && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Notlar:</Text>
                <Text style={styles.infoText}>{(item as MedicalProduct).notes}</Text>
              </View>
            )}
          </View>
        )}

        {isFood && (
          <View style={styles.tipCard}>
             <MaterialCommunityIcons name="lightbulb-on-outline" size={24} color={COLORS.amber} />
             <Text style={styles.tipText}>
               Bu değerler 100 gram üzerinden hesaplanmıştır. Tükettiğiniz miktara göre günlük limitinizden düşülecektir.
             </Text>
          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.bg,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: COLORS.bg,
  },
  errorText: {
    fontSize: 18,
    color: COLORS.text,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerBack: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
  },
  container: {
    padding: 20,
    alignItems: 'center',
    flexGrow: 1,
  },
  titleCard: {
    width: '100%',
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: COLORS.indigo,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 3,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.indigo,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: COLORS.indigo,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 5,
  },
  productName: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  brandBadge: {
    backgroundColor: COLORS.indigoLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.indigo + '30',
  },
  brandText: {
    color: COLORS.indigo,
    fontWeight: '700',
    fontSize: 12,
    textTransform: 'uppercase',
  },
  grid: {
    flexDirection: 'row',
    gap: 16,
    width: '100%',
    marginBottom: 20,
  },
  dataCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    shadowColor: COLORS.indigo,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  dataLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginTop: 8,
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  dataValue: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.indigo,
    marginTop: 4,
  },
  dataUnit: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '600',
    marginTop: 2,
  },
  infoCard: {
    width: '100%',
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 20,
    shadowColor: COLORS.indigo,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    marginBottom: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingBottom: 8,
  },
  cardHeaderTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
    marginLeft: 8,
  },
  infoRow: {
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  infoText: {
    fontSize: 15,
    color: COLORS.text,
    lineHeight: 22,
  },
  tipCard: {
    width: '100%',
    flexDirection: 'row',
    backgroundColor: '#FFFBEB',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FEF3C7',
  },
  tipText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 13,
    color: '#92400E',
    lineHeight: 18,
    fontWeight: '500',
  },
  backButton: {
    backgroundColor: COLORS.indigo,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  backButtonText: {
    color: COLORS.white,
    fontWeight: '700',
  },
});
