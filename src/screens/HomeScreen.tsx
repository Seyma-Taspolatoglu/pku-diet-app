import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Platform, StatusBar, ScrollView, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';

const meals = [
  { id: 1, name: 'Kahvaltı' },
  { id: 2, name: 'Öğle yemeği' },
  { id: 3, name: 'Akşam Yemeği' },
];

export default function HomeScreen() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);

  const addDays = (days: number) => {
    const nextDate = new Date(selectedDate);
    nextDate.setDate(selectedDate.getDate() + days);
    setSelectedDate(nextDate);
  };

  const onChangeDate = (event: any, date?: Date) => {
    setShowPicker(Platform.OS === 'ios'); // iOS picker behaves differently
    if (date) {
      setSelectedDate(date);
    }
  };

  const formatDate = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' };
    return date.toLocaleDateString('tr-TR', options);
  };

  const navigation = useNavigation();

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: () => (
        <View style={styles.headerDateNavigator}>
          <TouchableOpacity onPress={() => addDays(-1)} style={styles.headerDateArrow}>
            <Ionicons name="chevron-back" size={24} color="#666" />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setShowPicker(true)} style={styles.headerDateDisplay}>
            <Ionicons name="calendar-outline" size={20} color="#666" style={{ marginRight: 8 }} />
            <Text style={styles.headerDateText}>{formatDate(selectedDate)}</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => addDays(1)} style={styles.headerDateArrow}>
            <Ionicons name="chevron-forward" size={24} color="#666" />
          </TouchableOpacity>
        </View>
      ),
      headerTitleAlign: 'center',
    });
  }, [navigation, selectedDate]);

  return (
    <View style={[styles.container, { backgroundColor: '#4d071f99' }]}>
      <SafeAreaView style={styles.safeArea}>

        {/* Hidden Date Picker Modal */}
        {showPicker && (
          <DateTimePicker
            testID="dateTimePicker"
            value={selectedDate}
            mode="date"
            is24Hour={true}
            display="default"
            onChange={onChangeDate}
          />
        )}

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* 4. Main Summary Boxes (Static) */}
          <View style={styles.summaryContainer}>
            {/* Box 1 (Phe) */}
            <View style={styles.summaryBox}>
              <Ionicons name="add" size={20} color="#999" style={styles.addIcon} />
              <Text style={styles.largeNumber}>0</Text>
              <Text style={styles.smallLabel}>Kalan Fenilalanin</Text>
            </View>

            {/* Box 2 (PE) */}
            <View style={styles.summaryBox}>
              <Ionicons name="add" size={20} color="#999" style={styles.addIcon} />
              <Text style={styles.largeNumber}>0</Text>
              <Text style={styles.smallLabel}>Kalan Protein Eşdeğeri</Text>
            </View>
          </View>

          {/* 5. Usage Row (Static) */}
          <View style={styles.usageRow}>
            <View style={styles.usageBox}>
              <Text style={styles.usageValue}>0 mg</Text>
              <Text style={styles.usageLabel}>Kullanılan Fenilalanin</Text>
            </View>
            <View style={styles.usageBox}>
              <Text style={styles.usageValue}>0 PE gr</Text>
              <Text style={styles.usageLabel}>Alınan Protein Eşdeğeri</Text>
            </View>
            <View style={styles.usageBox}>
              <Text style={styles.usageValue}>0 kcal</Text>
              <Text style={styles.usageLabel}>Tüketilen Kalori</Text>
            </View>
          </View>

          {/* 6. Meals Section (Static) */}
          <View style={styles.mealsContainer}>
            {meals.map((meal, index) => (
              <View key={meal.id}>
                <View style={styles.mealCard}>

                  {/* Left: Meal Number Box */}
                  <View style={styles.mealNumberBox}>
                    <Text style={styles.mealNumberText}>{meal.id}</Text>
                  </View>

                  {/* Middle: Name and Empty State */}
                  <View style={styles.mealMiddle}>
                    <Text style={styles.mealName}>{meal.name}</Text>
                    <Text style={styles.mealEmptyText}>Seçili ürün yok</Text>
                  </View>

                  {/* Right: Actions and Metrics */}
                  <View style={styles.mealRight}>

                    <View style={styles.mealRightTop}>
                      <TouchableOpacity style={styles.mealTrashBtn}>
                        <MaterialCommunityIcons name="trash-can-outline" size={20} color="#999" />
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.mealAddBtn}>
                        <MaterialCommunityIcons name="plus" size={18} color="#0052cc" />
                      </TouchableOpacity>
                    </View>

                    <View style={styles.mealRightBottom}>
                      <Text style={[styles.mealMetric, { color: '#00bcd4' }]}>0</Text>
                      <Text style={[styles.mealMetric, { color: '#e91e63' }]}>0</Text>
                      <MaterialCommunityIcons name="menu-down" size={18} color="#999" style={styles.mealDropdownIcon} />
                    </View>

                  </View>

                </View>

                {/* Light gray divider line */}
                {index < meals.length - 1 && <View style={styles.divider} />}
              </View>
            ))}
          </View>

        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight ? StatusBar.currentHeight + 20 : 40 : 20,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },

  // Header Row
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 40,
  },
  welcomeText: {
    fontSize: 14,
    color: '#E0E0E0',
  },
  nameText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 4,
  },
  iconRow: {
    flexDirection: 'row',
  },
  iconButton: {
    marginLeft: 20,
  },

  // Main Summary Boxes
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 40,
  },
  summaryBox: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingVertical: 35,
    marginHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  addIcon: {
    position: 'absolute',
    top: 15,
    right: 15,
  },
  largeNumber: {
    fontSize: 52,
    fontWeight: 'bold',
    color: '#111111',
  },
  smallLabel: {
    fontSize: 13,
    color: '#555555',
    fontWeight: '600',
    marginTop: 5,
  },

  // Usage Row
  usageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
  usageBox: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 18,
    marginHorizontal: 5,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  usageValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111111',
    marginBottom: 4,
  },
  usageLabel: {
    fontSize: 10,
    color: '#777777',
    letterSpacing: 0.5,
    fontWeight: '600',
    textAlign: 'center',
  },

  // Header Date Navigator
  headerDateNavigator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerDateArrow: {
    paddingHorizontal: 15,
    paddingVertical: 5,
  },
  headerDateDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  headerDateText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
  },

  // Meals Section
  mealsContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    marginTop: 25,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  mealCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 18,
  },
  mealNumberBox: {
    width: 32,
    height: 32,
    borderWidth: 1,
    borderColor: '#EEEEEE',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  mealNumberText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#555555',
  },
  mealMiddle: {
    flex: 1,
    justifyContent: 'center',
  },
  mealName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111111',
    marginBottom: 4,
  },
  mealEmptyText: {
    fontSize: 12,
    color: '#999999',
  },
  mealRight: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    minHeight: 45,
  },
  mealRightTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  mealTrashBtn: {
    marginRight: 12,
  },
  mealAddBtn: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#E6F0FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mealRightBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  mealMetric: {
    fontSize: 13,
    fontWeight: 'bold',
    marginRight: 10,
  },
  mealDropdownIcon: {
    marginRight: -4,
  },
  divider: {
    height: 1,
    backgroundColor: '#F5F5F5',
    marginHorizontal: 15,
  },
});
