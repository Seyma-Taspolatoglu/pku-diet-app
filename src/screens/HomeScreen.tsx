import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import React, { useCallback, useLayoutEffect, useState } from 'react';
import { SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import CalendarModal from '../components/CalendarModal';
import SummaryCard from '../components/SummaryCard';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { userLogService } from '../services/userLogService';
import { UserLog } from '../types/database';

const meals = [
  { id: 1, name: 'Kahvaltı', type: 'Breakfast', icon: 'coffee-outline' },
  { id: 2, name: 'Öğle Yemeği', type: 'Lunch', icon: 'food-apple-outline' },
  { id: 3, name: 'Akşam Yemeği', type: 'Dinner', icon: 'food-variant' },
];

const COLORS = {
  indigo: '#4F46E5', // Vibrant Primary
  indigoLight: '#EEF2FF',
  emerald: '#10B981', // Success / Healthy
  emeraldLight: '#ECFDF5',
  amber: '#F59E0B', // Warning / Near limit
  white: '#FFFFFF',
  bg: '#FCFDFF', // Very light crisp background
  text: '#1E1B4B', // Deep indigo text
  textSecondary: '#6366F1', // Secondary Indigo
  border: '#E0E7FF',
  red: '#EF4444',
  blue: '#3B82F6',
};

export default function HomeScreen() {
  const { user } = useAuth();
  const navigation = useNavigation<any>();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [dailyLogs, setDailyLogs] = useState<UserLog[]>([]);
  const [dailyPheLimit, setDailyPheLimit] = useState<number | null>(null);
  const [dailyTyrosineLimit, setDailyTyrosineLimit] = useState<number | null>(null);

  // Totals
  let consumedPhe = 0;
  let consumedProteinEq = 0;
  let consumedTyrosine = 0;

  dailyLogs.forEach(log => {
    consumedPhe += Number(log.total_phe || 0);
    consumedProteinEq += Number(log.total_protein_eq || 0);

    // Tirozin hesaplaması (Sadece tıbbi ürünler/mamalar için)
    // tyrosine_per_100 (g) -> mg için: (g/100) * miktar * 1000 = g * 10 * miktar
    if (log.medical_product && log.medical_product.tyrosine_per_100) {
      const tyrVal = Number(log.medical_product.tyrosine_per_100);
      const weight = Number(log.gram_amount);
      consumedTyrosine += (tyrVal * 10 * weight);
    }
  });

  const remainingPhe = dailyPheLimit !== null ? dailyPheLimit - consumedPhe : null;
  const remainingTyrosine = dailyTyrosineLimit !== null ? dailyTyrosineLimit - consumedTyrosine : null;

  const [expandedMeals, setExpandedMeals] = useState<Record<string, boolean>>({});

  const toggleExpand = (mealType: string) => {
    setExpandedMeals(prev => ({
      ...prev,
      [mealType]: !prev[mealType]
    }));
  };

  const handleDeleteLog = async (logId: string) => {
    try {
      if (!logId) return;
      await userLogService.deleteUserLog(logId);
      // Refresh data
      const queryDate = selectedDate.toLocaleDateString('en-CA'); // YYYY-MM-DD
      const logs = await userLogService.getDailyLogs(user!.id, queryDate);
      setDailyLogs(logs);
    } catch (e) {
      console.log('Error deleting log:', e);
      alert('Silme işlemi sırasında bir hata oluştu.');
    }
  };

  useFocusEffect(
    useCallback(() => {
      const loadData = async () => {
        try {
          if (!user) return;
          const { data } = await supabase
            .from('user_limits')
            .select('daily_phe_limit, daily_tyrosine_limit')
            .eq('user_id', user.id)
            .limit(1);

          if (data && data.length > 0) {
            const limits = data[0];
            setDailyPheLimit(limits.daily_phe_limit);
            setDailyTyrosineLimit(limits.daily_tyrosine_limit);
          } else {
            // Hiç kayıt yoksa limitsiz başla
            setDailyPheLimit(null);
            setDailyTyrosineLimit(null);
          }

          const queryDate = selectedDate.toLocaleDateString('en-CA'); // YYYY-MM-DD format (safe)
          const logs = await userLogService.getDailyLogs(user.id, queryDate);
          setDailyLogs(logs);
        } catch (e) {
          console.log('Error loading data:', e);
        }
      };
      loadData();
    }, [user, selectedDate])
  );

  const addDays = (days: number) => {
    const nextDate = new Date(selectedDate);
    nextDate.setDate(selectedDate.getDate() + days);
    setSelectedDate(nextDate);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' });
  };

  // Navbar Date Control
  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: () => (
        <View style={styles.navDateContainer}>
          <TouchableOpacity onPress={() => addDays(-1)} style={styles.navArrow}>
            <Ionicons name="chevron-back" size={24} color={COLORS.indigo} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setShowPicker(true)} style={styles.navDateDisplay}>
            <Ionicons name="calendar-outline" size={18} color={COLORS.indigo} style={{ marginRight: 8 }} />
            <Text style={styles.navDateText}>{formatDate(selectedDate)}</Text>
            <Ionicons name="chevron-down" size={14} color={COLORS.indigo} style={{ marginLeft: 4 }} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => addDays(1)} style={styles.navArrow}>
            <Ionicons name="chevron-forward" size={24} color={COLORS.indigo} />
          </TouchableOpacity>
        </View>
      ),
      headerStyle: {
        backgroundColor: COLORS.white,
        elevation: 0,
        shadowOpacity: 0,
        borderBottomWidth: 0,
      },
      headerTitleAlign: 'center',
    });
  }, [navigation, selectedDate]);



  const statusLogic = (val: number, limit: number | null, prefix: string) => {
    if (limit === null) return { text: `${prefix} Seviyesi Normal.`, color: COLORS.emerald, bgColor: '#F0FDF4' };
    if (val > limit) return { text: `${prefix} Limit Üstünde!`, color: COLORS.red, bgColor: '#FEF2F2' };
    if (val >= limit * 0.9) return { text: `${prefix} Sınıra Yakın.`, color: COLORS.amber, bgColor: '#FFFBEB' };
    return { text: `${prefix} Seviyesi Normal.`, color: COLORS.emerald, bgColor: '#F0FDF4' };
  };

  const pheStatus = statusLogic(consumedPhe, dailyPheLimit, 'PHE');
  const tyrStatus = statusLogic(consumedTyrosine, dailyTyrosineLimit, 'Tirozin');

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <CalendarModal
        visible={showPicker}
        onClose={() => setShowPicker(false)}
        selectedDate={selectedDate}
        onDateSelect={(date) => setSelectedDate(date)}
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Energetic Cards */}
        <View style={styles.summaryGrid}>
          <SummaryCard
            label="Kalan Fenilalanin"
            value={remainingPhe !== null ? remainingPhe.toFixed(0) : 'Limit Belirlenmedi'}
            unit="mg"
            icon="lightning-bolt"
            color={COLORS.indigo}
            style={styles.summaryCardHalf}
          />
          <View style={{ width: 12 }} />
          <SummaryCard
            label="Kalan Tirozin"
            value={remainingTyrosine !== null ? remainingTyrosine.toFixed(0) : 'Limit Belirlenmedi'}
            unit="mg"
            icon="heart-pulse"
            color={COLORS.blue}
            style={styles.summaryCardHalf}
          />
        </View>

        {/* Vibrant Metrics Row */}
        <View style={styles.metricsRow}>
          <View style={styles.metricItem}>
            <MaterialCommunityIcons name="molecule" size={18} color={COLORS.indigo} />
            <Text style={styles.metricValue}>{consumedPhe.toFixed(0)}</Text>
            <Text style={styles.metricLabel}>Kullanılan fenilanin (mg)</Text>
          </View>
          <View style={styles.metricItem}>
            <MaterialCommunityIcons name="heart-pulse" size={18} color={COLORS.blue} />
            <Text style={styles.metricValue}>{consumedTyrosine.toFixed(0)}</Text>
            <Text style={styles.metricLabel}>Kullanılan Tirozin (mg)</Text>
          </View>
          <View style={styles.metricItem}>
            <MaterialCommunityIcons name="food-variant" size={18} color={COLORS.emerald} />
            <Text style={styles.metricValue}>{consumedProteinEq.toFixed(1)}</Text>
            <Text style={styles.metricLabel}>Toplam Protein (g)</Text>
          </View>
        </View>

        {/* Refined Section Header */}
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <View style={styles.titleAccent} />
            <View>
              <Text style={styles.sectionTitle}>Bugünkü Öğünler</Text>
              <Text style={styles.sectionSubtitle}>Günlük diyet planınızı buradan takip edin</Text>
            </View>
          </View>
        </View>

        <View style={styles.listContainer}>
          {meals.map((meal, index) => {
            const mealLogs = dailyLogs.filter(l => l.meal_type === meal.type);
            const mealColor = index === 0 ? '#6366F1' : index === 1 ? '#F59E0B' : '#10B981';
            const isExpanded = !!expandedMeals[meal.type];

            return (
              <View key={meal.id}>
                <TouchableOpacity
                  style={styles.mealRow}
                  activeOpacity={0.7}
                  onPress={() => {
                    if (mealLogs.length > 0) {
                      toggleExpand(meal.type);
                    } else {
                      navigation.navigate('Products', {
                        screen: 'ProductsMain', params: { mealId: meal.id, date: selectedDate.toLocaleDateString('en-CA') }
                      });
                    }
                  }}
                >
                  <View style={[styles.mealIconBox, { backgroundColor: mealColor + '15' }]}>
                    <MaterialCommunityIcons name={meal.icon as any} size={22} color={mealColor} />
                  </View>
                  <View style={styles.mealContent}>
                    <Text style={styles.mealName}>{meal.name}</Text>
                    <Text style={styles.mealSubtitle}>{mealLogs.length > 0 ? `${mealLogs.length} ürün eklendi` : 'Hadi bir şeyler ekleyelim!'}</Text>
                  </View>
                  <View style={styles.mealRightInfo}>
                    {mealLogs.length > 0 ? (
                      <>
                        <Text style={[styles.mealValueText, { color: mealColor }]}>
                          {mealLogs.reduce((a, b) => a + (b.total_phe || 0), 0).toFixed(0)} PHE
                        </Text>
                        <Ionicons name={isExpanded ? "chevron-up" : "chevron-down"} size={20} color={mealColor} />
                      </>
                    ) : (
                      <View style={[styles.addIconCircle, { backgroundColor: mealColor }]}>
                        <Ionicons name="add" size={20} color={COLORS.white} />
                      </View>
                    )}
                  </View>
                </TouchableOpacity>

                {/* Expanded Content */}
                {isExpanded && mealLogs.length > 0 && (
                  <View style={styles.expandedContent}>
                    {mealLogs.map((log) => {
                      const productName = log.food?.food_name || log.medical_product?.product_name || 'Bilinmeyen Ürün';
                      return (
                        <View key={log.id} style={styles.logItem}>
                          <View style={styles.logInfo}>
                            <Text style={styles.logName} numberOfLines={1}>{productName}</Text>
                            <Text style={styles.logDetails}>
                              {log.gram_amount}g • {log.total_phe.toFixed(0)} PHE • {log.total_protein_eq.toFixed(1)}g Pro
                              {log.medical_product ? ` • ${(log.medical_product.tyrosine_per_100! * 10 * log.gram_amount).toFixed(0)}mg Tyr` : ''}
                            </Text>
                          </View>
                          <TouchableOpacity onPress={() => handleDeleteLog(log.id!)} style={styles.deleteButton}>
                            <Ionicons name="trash-outline" size={18} color={COLORS.red} />
                          </TouchableOpacity>
                        </View>
                      )
                    })}
                    <TouchableOpacity
                      style={styles.addMoreButton}
                      onPress={() => navigation.navigate('Products', {
                        screen: 'ProductsMain', params: { mealId: meal.id, date: selectedDate.toLocaleDateString('en-CA') }
                      })}
                    >
                      <Ionicons name="add-circle-outline" size={18} color={COLORS.indigo} />
                      <Text style={styles.addMoreText}>Ürün Ekle</Text>
                    </TouchableOpacity>
                  </View>
                )}
                {index < meals.length - 1 && <View style={styles.rowDivider} />}
              </View>
            );
          })}
        </View>

        <View style={styles.alertsWrapper}>
          <View style={[styles.statusAlert, { backgroundColor: pheStatus.bgColor, borderColor: pheStatus.color + '30' }]}>
            <Ionicons name="information-circle" size={22} color={pheStatus.color} style={{ marginRight: 10 }} />
            <Text style={[styles.statusAlertText, { color: pheStatus.color }]}>{pheStatus.text}</Text>
          </View>
          <View style={[styles.statusAlert, { backgroundColor: tyrStatus.bgColor, marginTop: 12, borderColor: tyrStatus.color + '30' }]}>
            <Ionicons name="information-circle" size={22} color={tyrStatus.color} style={{ marginRight: 10 }} />
            <Text style={[styles.statusAlertText, { color: tyrStatus.color }]}>{tyrStatus.text}</Text>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  scrollContent: {
    flexGrow: 1, // Full height support
    justifyContent: 'center', // Vertical centering
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  navDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  navArrow: {
    padding: 8,
  },
  navDateDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 6,
    backgroundColor: COLORS.indigoLight,
    borderRadius: 20,
  },
  navDateText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.indigo,
  },
  summaryGrid: {
    flexDirection: 'row',
    marginBottom: 20,
    marginTop: 10,
  },
  summaryCardHalf: {
    flex: 1,
  },
  metricsRow: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    paddingVertical: 20,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: 25,
    shadowColor: COLORS.indigo,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 3,
  },
  metricItem: {
    alignItems: 'center',
    flex: 1,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.text,
    marginTop: 4,
  },
  metricLabel: {
    fontSize: 10,
    color: COLORS.textSecondary,
    marginTop: 2,
    fontWeight: '600',
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  sectionHeader: {
    marginBottom: 20,
    backgroundColor: COLORS.indigoLight,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  titleAccent: {
    width: 4,
    height: 32,
    backgroundColor: COLORS.indigo,
    borderRadius: 2,
    marginRight: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.text,
    letterSpacing: -0.5,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 1,
    fontWeight: '500',
  },
  listContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: COLORS.indigo,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 3,
    marginBottom: 25,
  },
  mealRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
  },
  mealIconBox: {
    width: 46,
    height: 46,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  mealContent: {
    flex: 1,
  },
  mealName: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.text,
  },
  mealSubtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 3,
    fontWeight: '500',
  },
  mealRightInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mealValueText: {
    fontSize: 15,
    fontWeight: '700',
    marginRight: 8,
  },
  rowDivider: {
    height: 1,
    backgroundColor: COLORS.indigoLight,
    marginHorizontal: 20,
  },
  alertsWrapper: {
    marginTop: 5,
    marginBottom: 20,
  },
  statusAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
  },
  statusAlertText: {
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
  },
  addIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  expandedContent: {
    backgroundColor: '#F9FBFF',
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  logItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEF2FF',
  },
  logInfo: {
    flex: 1,
  },
  logName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  logDetails: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  deleteButton: {
    padding: 8,
  },
  addMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    paddingVertical: 8,
    backgroundColor: COLORS.white,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.indigoLight,
    borderStyle: 'dashed',
  },
  addMoreText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.indigo,
    marginLeft: 6,
  },
});
