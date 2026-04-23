import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ProductsScreen from '../screens/ProductsScreen';
import AllProductsScreen from '../screens/AllProductsScreen';
import FoodDetailsScreen from '../screens/FoodDetailsScreen';
import CreateProductScreen from '../screens/CreateProductScreen';

const Stack = createNativeStackNavigator();

export default function ProductsStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="ProductsMain" 
        component={ProductsScreen} 
        options={{ 
          title: 'Ürün Seçin', 
          headerTitleAlign: 'center',
          headerShown: false
        }} 
      />
      <Stack.Screen 
        name="AllProducts" 
        component={AllProductsScreen} 
        options={{ 
          title: 'Tüm Ürünler',
          headerTitleAlign: 'center',
        }} 
      />
      <Stack.Screen 
        name="FoodDetails" 
        component={FoodDetailsScreen} 
        options={{ 
          headerShown: false, // Custom header used in screen
          title: 'Ürün Detayı'
        }} 
      />
      <Stack.Screen 
        name="CreateProduct" 
        component={CreateProductScreen} 
        options={{ 
          headerShown: false,
          title: 'Yeni Ürün Oluştur'
        }} 
      />
    </Stack.Navigator>
  );
}
