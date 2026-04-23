import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

// Use strict relative imports for screens
// @ts-ignore
import HomeScreen from '../screens/HomeScreen';
// @ts-ignore
import ProductsStack from './ProductsStack';
// @ts-ignore
import ProfileScreen from '../screens/ProfileScreen';

export type MainTabsParamList = {
  Home: undefined;
  Products: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<MainTabsParamList>();

export default function MainTabs({ initialRoute = 'Home' }: { initialRoute?: keyof MainTabsParamList }) {
  return (
    <Tab.Navigator
      initialRouteName={initialRoute}
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'restaurant';

          if (route.name === 'Home') {
            iconName = focused ? 'restaurant' : 'restaurant-outline';
          } else if (route.name === 'Products') {
            iconName = focused ? 'search' : 'search-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#6200ee',
        tabBarInactiveTintColor: 'gray',
        headerShown: true,
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ tabBarLabel: 'Diyet', headerTitle: '' }}
      />
      <Tab.Screen
        name="Products"
        component={ProductsStack}
        options={{ 
          title: 'Ürün Seçin', 
          headerTitleAlign: 'center',
          tabBarLabel: 'Ürünler',
          headerShown: false // Prevent double headers
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ 
          title: 'Profil',
          headerShown: false 
        }}
      />
    </Tab.Navigator>
  );
}
