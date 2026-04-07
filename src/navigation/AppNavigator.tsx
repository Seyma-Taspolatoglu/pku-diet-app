import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { Text } from 'react-native-paper';

import AuthStack from './AuthStack';
import MainTabs from './MainTabs';
import { useAuth } from '../context/AuthContext';

export default function AppNavigator() {
  const { session, isLoading } = useAuth();

  // Show a full-screen loading spinner while session initializes
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6200ee" />
        <Text style={styles.loadingText}>Yükleniyor...</Text>
      </View>
    );
  }

  // Force strict navigation
  return (
    <NavigationContainer>
      {session && session.user ? <MainTabs /> : <AuthStack />}
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff', // Ensures a clean background
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: '#6200ee',
    fontWeight: 'bold',
  }
});