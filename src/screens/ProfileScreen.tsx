import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  Alert, 
  ScrollView, 
  SafeAreaView, 
  StatusBar, 
  TouchableOpacity,
  Platform 
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';

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

export default function ProfileScreen() {
  const { signOut, user } = useAuth();
  const [pheLimit, setPheLimit] = useState('');
  const [tyrosineLimit, setTyrosineLimit] = useState('');
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState<{name: string, surname: string} | null>(null);

  useEffect(() => {
    loadLimits();
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      if (!user) return;
      
      // users tablosundan isim ve soyisim çekme denemesi
      const { data, error } = await supabase
        .from('users')
        .select('name, surname')
        .eq('id', user.id);
      
      if (error) {
        console.log('Profile fetch error:', error.message);
        setUserData({ name: '', surname: '' });
        return;
      }

      if (data && data.length > 0) {
        setUserData(data[0]);
      } else {
        setUserData({ name: '', surname: '' });
      }
    } catch (e) {
      console.log('Error loading profile detail:', e);
      setUserData({ name: '', surname: '' });
    }
  };

  const loadLimits = async () => {
    try {
      if (!user) return;
      
      const { data, error } = await supabase
        .from('user_limits')
        .select('daily_phe_limit, daily_tyrosine_limit')
        .eq('user_id', user.id);
        
      if (data && data.length > 0) {
        const limits = data[0];
        if (limits.daily_phe_limit != null) setPheLimit(limits.daily_phe_limit.toString());
        if (limits.daily_tyrosine_limit != null) setTyrosineLimit(limits.daily_tyrosine_limit.toString());
      }
    } catch (e) {
      console.log('Error loading limits:', e);
    }
  };

  const saveLimits = async () => {
    try {
      setLoading(true);
      if (!user) return;
      const pLimit = parseFloat(pheLimit);
      const tLimit = parseFloat(tyrosineLimit);

      const { data: existing, error: checkError } = await supabase
        .from('user_limits')
        .select('user_id')
        .eq('user_id', user.id);

      const hasExisting = existing && existing.length > 0;

      if (hasExisting) {
        const { error } = await supabase
          .from('user_limits')
          .update({
            daily_phe_limit: isNaN(pLimit) ? null : pLimit,
            daily_tyrosine_limit: isNaN(tLimit) ? null : tLimit,
          })
          .eq('user_id', user.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('user_limits')
          .insert([{
            user_id: user.id,
            daily_phe_limit: isNaN(pLimit) ? null : pLimit,
            daily_tyrosine_limit: isNaN(tLimit) ? null : tLimit,
          }]);
        if (error) throw error;
      }

      await AsyncStorage.setItem('pheLimit', pheLimit);
      await AsyncStorage.setItem('tyrosineLimit', tyrosineLimit);
      Alert.alert('Başarılı', 'Günlük limitleriniz güncellendi.');
    } catch (e: any) {
      console.log('Error saving limits:', e);
      Alert.alert('Hata', 'Kaydedilirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      <StatusBar barStyle="dark-content" />
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        
        {/* User Header Section */}
        <View style={styles.userSection}>
          <View style={styles.avatarContainer}>
            <MaterialCommunityIcons name="account" size={50} color={COLORS.indigo} />
          </View>
          <Text style={styles.userName}>Profilim</Text>
          <Text style={styles.userEmail}>
            {user?.user_metadata?.name 
              ? `${user.user_metadata.name} ${user.user_metadata.surname || ''}`
              : (userData && (userData.name || userData.surname)) 
                ? `${userData.name} ${userData.surname}` 
                : user?.email || '...'}
          </Text>
        </View>

        {/* Limits Dashboard Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <MaterialCommunityIcons name="cog-outline" size={20} color={COLORS.indigo} />
            <Text style={styles.cardTitle}>Diyet Limitleri</Text>
          </View>

          <View style={styles.inputWrapper}>
             <Text style={styles.inputLabel}>Günlük Fenilalanin Limiti (mg)</Text>
             <View style={styles.inputContainer}>
                <MaterialCommunityIcons name="lightning-bolt" size={20} color={COLORS.indigo} style={styles.inputIcon} />
                <TextInput
                  placeholder="0"
                  keyboardType="numeric"
                  value={pheLimit}
                  onChangeText={setPheLimit}
                  style={styles.input}
                  underlineColorAndroid="transparent"
                  {...Platform.select({ web: { outlineStyle: 'none' } as any })}
                />
             </View>
          </View>

          <View style={styles.inputWrapper}>
             <Text style={styles.inputLabel}>Günlük Tirozin Limiti (mg)</Text>
             <View style={styles.inputContainer}>
                <MaterialCommunityIcons name="heart-pulse" size={20} color={COLORS.blue} style={styles.inputIcon} />
                <TextInput
                  placeholder="0"
                  keyboardType="numeric"
                  value={tyrosineLimit}
                  onChangeText={setTyrosineLimit}
                  style={styles.input}
                  underlineColorAndroid="transparent"
                  {...Platform.select({ web: { outlineStyle: 'none' } as any })}
                />
             </View>
          </View>

          <TouchableOpacity 
            style={[styles.saveButton, loading && { opacity: 0.7 }]} 
            onPress={saveLimits}
            disabled={loading}
          >
            <Text style={styles.saveButtonText}>{loading ? 'Kaydediliyor...' : 'Limitleri Kaydet'}</Text>
          </TouchableOpacity>
        </View>

        {/* Logout Section */}
        <TouchableOpacity style={styles.logoutButton} onPress={signOut}>
          <MaterialCommunityIcons name="logout" size={20} color={COLORS.red} />
          <Text style={styles.logoutText}>Oturumu Kapat</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  container: {
    padding: 24,
    alignItems: 'center',
    flexGrow: 1,
    justifyContent: 'center',
  },
  userSection: {
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 10,
  },
  avatarContainer: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: COLORS.indigo,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
    borderWidth: 2,
    borderColor: COLORS.indigoLight,
  },
  userName: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.text,
    letterSpacing: -0.5,
  },
  userEmail: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 4,
    fontWeight: '500',
  },
  card: {
    width: '100%',
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
    marginBottom: 24,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginLeft: 10,
  },
  inputWrapper: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 10,
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
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    shadowColor: COLORS.indigo,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  saveButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: COLORS.red + '20',
    backgroundColor: COLORS.white,
  },
  logoutText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.red,
    marginLeft: 10,
  },
  versionText: {
    marginTop: 32,
    fontSize: 12,
    color: '#CBD5E0',
    fontWeight: '500',
  },
});
