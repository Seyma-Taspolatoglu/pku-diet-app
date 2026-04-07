import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider as PaperProvider } from 'react-native-paper';
import { AuthProvider } from './src/context/AuthContext';
import AppNavigator from './src/navigation/AppNavigator'; // Now references .tsx

export default function App() {
  return (
    // 1. Root GestureHandler for Pan/Swipe navigations
    <GestureHandlerRootView style={{ flex: 1 }}> 
      {/* 2. SafeArea handling padding around notches and bars */}
      <SafeAreaProvider>
        {/* 3. Global Authentication Provider (Must be outside the navigator to conditionally render the AppNavigator) */}
        <AuthProvider>
          {/* 4. Global Theming via React Native Paper */}
          <PaperProvider>
            {/* 5. Main routing component */}
            <AppNavigator />
          </PaperProvider>
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}