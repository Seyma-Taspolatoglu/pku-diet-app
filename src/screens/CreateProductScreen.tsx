import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Animated,
  Dimensions
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { foodService } from '../services/foodService';

const { width } = Dimensions.get('window');

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

type ProductType = 'natural' | 'medical';

export default function CreateProductScreen() {
  const navigation = useNavigation<any>();
  const [loading, setLoading] = useState(false);
  const [productType, setProductType] = useState<ProductType>('natural');

  // Animation values for toast (Right to Left)
  const toastX = useRef(new Animated.Value(width)).current;
  const [toastVisible, setToastVisible] = useState(false);

  // Common Fields
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');

  // Natural Fields
  const [protein, setProtein] = useState('');
  const [phe, setPhe] = useState('');

  // Medical Fields
  const [proteinEq, setProteinEq] = useState('');
  const [tyrosine, setTyrosine] = useState('');

  const showToast = () => {
    setToastVisible(true);
    Animated.sequence([
      Animated.timing(toastX, {
        toValue: 20, // Slide in from right to 20px from edge
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.delay(2000),
      Animated.timing(toastX, {
        toValue: width, // Slide back to right
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setToastVisible(false);
      navigation.goBack();
    });
  };

  const handleSave = async () => {
    if (!name.trim()) {
      return;
    }

    setLoading(true);
    try {
      if (productType === 'natural') {
        await foodService.createFood({
          food_name: name,
          protein_per_100g: parseFloat(protein) || 0,
          phe_per_1g_protein: parseFloat(phe) || 0,
        });
      } else {
        await foodService.createMedicalProduct({
          product_name: name,
          brand: brand,
          protein_equivalent_pe: parseFloat(proteinEq) || 0,
          tyrosine_per_100: parseFloat(tyrosine) || 0,
          form: 'Toz', 
        });
      }

      showToast();
    } catch (error) {
      console.error('Ürün kaydedilirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      
      {/* Animated Toast Notification (From Right) */}
      <Animated.View style={[styles.toast, { transform: [{ translateX: toastX }] }]}>
        <View style={styles.toastContent}>
          <Ionicons name="checkmark-circle" size={30} color={COLORS.white} />
          <Text style={styles.toastText}>Ürün Kaydedildi!</Text>
        </View>
      </Animated.View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={COLORS.indigo} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Yeni Ürün Oluştur</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.formCard}>
            {/* Type Selector */}
            <View style={styles.typeSelector}>
              <TouchableOpacity 
                style={[styles.typeOption, productType === 'natural' && styles.typeOptionActive]}
                onPress={() => setProductType('natural')}
              >
                <MaterialCommunityIcons 
                  name="leaf" 
                  size={20} 
                  color={productType === 'natural' ? COLORS.white : COLORS.textSecondary} 
                />
                <Text style={[styles.typeText, productType === 'natural' && styles.typeTextActive]}>Doğal Gıda</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.typeOption, productType === 'medical' && styles.typeOptionActive]}
                onPress={() => setProductType('medical')}
              >
                <MaterialCommunityIcons 
                  name="pill" 
                  size={20} 
                  color={productType === 'medical' ? COLORS.white : COLORS.textSecondary} 
                />
                <Text style={[styles.typeText, productType === 'medical' && styles.typeTextActive]}>Tıbbi Ürün</Text>
              </TouchableOpacity>
            </View>

            {/* General Info */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Genel Bilgiler</Text>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Ürün Adı</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="nutrition-outline" size={20} color={COLORS.indigo} style={styles.inputIcon} />
                  <TextInput 
                    style={styles.input}
                    placeholder="Örn: Elma, PKU Mama"
                    value={name}
                    onChangeText={setName}
                    placeholderTextColor="#999"
                    {...Platform.select({ web: { outlineStyle: 'none' } as any })}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>{productType === 'natural' ? 'Kategori' : 'Marka'}</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="pricetag-outline" size={20} color={COLORS.indigo} style={styles.inputIcon} />
                  <TextInput 
                    style={styles.input}
                    placeholder={productType === 'natural' ? "Örn: Meyve" : "Örn: Nutricia"}
                    value={brand}
                    onChangeText={setBrand}
                    placeholderTextColor="#999"
                    {...Platform.select({ web: { outlineStyle: 'none' } as any })}
                  />
                </View>
              </View>
            </View>

            {/* Nutritional Values */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Besin Değerleri (100g için)</Text>
              
              {productType === 'natural' ? (
                <>
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Protein (g)</Text>
                    <View style={styles.inputContainer}>
                      <MaterialCommunityIcons name="food-apple-outline" size={20} color={COLORS.indigo} style={styles.inputIcon} />
                      <TextInput 
                        style={styles.input}
                        placeholder="0.0"
                        keyboardType="numeric"
                        value={protein}
                        onChangeText={setProtein}
                        placeholderTextColor="#999"
                        {...Platform.select({ web: { outlineStyle: 'none' } as any })}
                      />
                    </View>
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Fenilalanin (PHE) (mg/100g)</Text>
                    <View style={styles.inputContainer}>
                      <MaterialCommunityIcons name="molecule" size={20} color={COLORS.indigo} style={styles.inputIcon} />
                      <TextInput 
                        style={styles.input}
                        placeholder="0"
                        keyboardType="numeric"
                        value={phe}
                        onChangeText={setPhe}
                        placeholderTextColor="#999"
                        {...Platform.select({ web: { outlineStyle: 'none' } as any })}
                      />
                    </View>
                  </View>
                </>
              ) : (
                <>
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Protein Eşdeğeri (PE) (g)</Text>
                    <View style={styles.inputContainer}>
                      <MaterialCommunityIcons name="flask-outline" size={20} color={COLORS.indigo} style={styles.inputIcon} />
                      <TextInput 
                        style={styles.input}
                        placeholder="0.0"
                        keyboardType="numeric"
                        value={proteinEq}
                        onChangeText={setProteinEq}
                        placeholderTextColor="#999"
                        {...Platform.select({ web: { outlineStyle: 'none' } as any })}
                      />
                    </View>
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Tirozin (g)</Text>
                    <View style={styles.inputContainer}>
                      <MaterialCommunityIcons name="heart-pulse" size={20} color={COLORS.blue} style={styles.inputIcon} />
                      <TextInput 
                        style={styles.input}
                        placeholder="0.0"
                        keyboardType="numeric"
                        value={tyrosine}
                        onChangeText={setTyrosine}
                        placeholderTextColor="#999"
                        {...Platform.select({ web: { outlineStyle: 'none' } as any })}
                      />
                    </View>
                  </View>
                </>
              )}
            </View>

            <TouchableOpacity 
              style={[styles.saveButton, loading && { opacity: 0.7 }]}
              onPress={handleSave}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <>
                  <Ionicons name="checkmark-circle-outline" size={22} color={COLORS.white} style={{ marginRight: 8 }} />
                  <Text style={styles.saveButtonText}>Ürünü Kaydet</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  toast: {
    position: 'absolute',
    top: 30, // Adjusted top spacing
    right: 0,
    zIndex: 9999,
  },
  toastContent: {
    backgroundColor: COLORS.indigo,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18, // Padding increased
    paddingHorizontal: 28, // Padding increased
    borderTopLeftRadius: 24,
    borderBottomLeftRadius: 24,
    shadowColor: COLORS.indigo,
    shadowOffset: { width: -6, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 15,
    gap: 15,
  },
  toastText: {
    color: COLORS.white,
    fontSize: 18, // Font size increased
    fontWeight: '800',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: COLORS.bg, // Matched background to remove line
    borderBottomWidth: 0, // Explicitly removed border
    elevation: 0, // Removed shadow/elevation
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.text,
    letterSpacing: -0.5,
  },
  backButton: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: COLORS.indigoLight,
  },
  scrollContent: {
    padding: 20,
    flexGrow: 1,
    justifyContent: 'center',
  },
  formCard: {
    backgroundColor: COLORS.white,
    borderRadius: 32,
    padding: 24,
    shadowColor: COLORS.indigo,
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.08,
    shadowRadius: 30,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  typeSelector: {
    flexDirection: 'row',
    backgroundColor: COLORS.indigoLight,
    borderRadius: 16,
    padding: 6,
    marginBottom: 24,
  },
  typeOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  typeOptionActive: {
    backgroundColor: COLORS.indigo,
    shadowColor: COLORS.indigo,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  typeText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  typeTextActive: {
    color: COLORS.white,
  },
  section: {
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.indigo,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 16,
    marginLeft: 4,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 8,
    marginLeft: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 16,
    height: 56,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: COLORS.text,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: COLORS.indigo,
    height: 60,
    borderRadius: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    shadowColor: COLORS.indigo,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 6,
  },
  saveButtonText: {
    color: COLORS.white,
    fontSize: 17,
    fontWeight: '800',
  },
});
