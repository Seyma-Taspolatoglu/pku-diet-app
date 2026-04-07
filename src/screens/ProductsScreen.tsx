import React from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, SafeAreaView, Platform, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function ProductsScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#888" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Ürün ara..."
            placeholderTextColor="#999"
          />
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
        </View>

        {/* Fill empty space where list will be */}
        <View style={styles.listArea}>
          {/* Future FlatList of products will render here */}
        </View>

        {/* Bottom Buttons */}
        <View style={styles.bottomButtonsContainer}>
          <TouchableOpacity style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>Tüm Ürünler</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.primaryButton, { marginTop: 10 }]}>
            <Text style={styles.primaryButtonText}>Bir Ürün Oluşturun</Text>
          </TouchableOpacity>
        </View>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FAFAFA',
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
    backgroundColor: '#EEEEEE',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 48,
    marginBottom: 20,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    height: '100%',
  },

  // Table Header Row
  listHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    paddingBottom: 10,
    marginBottom: 10,
  },
  colLeft: {
    flex: 2,
    fontSize: 14,
    fontWeight: 'bold',
    color: '#555',
  },
  colCenter: {
    flex: 1,
    alignItems: 'center',
  },
  colRight: {
    flex: 1,
    alignItems: 'center',
  },
  colMainText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#555',
  },
  colSubText: {
    fontSize: 11,
    color: '#888',
    marginTop: 2,
  },

  // List Placeholder
  listArea: {
    flex: 1,
  },

  // Bottom Buttons
  bottomButtonsContainer: {
    paddingVertical: 20,
  },
  primaryButton: {
    backgroundColor: '#8E0054', // PKU App Magenta
    borderRadius: 8,
    paddingVertical: 15,
    alignItems: 'center',
    marginBottom: 10,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: '#8E0054',
    borderRadius: 8,
    paddingVertical: 15,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#8E0054',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
