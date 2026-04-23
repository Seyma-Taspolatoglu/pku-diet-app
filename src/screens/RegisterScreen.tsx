import React, { useState } from 'react';
import { 
  View, 
  StyleSheet, 
  Alert, 
  ScrollView, 
  KeyboardAvoidingView, 
  Platform, 
  TouchableOpacity, 
  SafeAreaView, 
  StatusBar,
  TextInput
} from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';

const COLORS = {
  indigo: '#4F46E5',
  indigoLight: '#EEF2FF',
  white: '#FFFFFF',
  bg: '#FCFDFF',
  text: '#1E1B4B',
  textSecondary: '#6366F1',
  border: '#E0E7FF',
  red: '#EF4444',
};

export default function RegisterScreen({ navigation }: any) {
  const { signUp } = useAuth();
  
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleRegister = async () => {
    setErrorMessage('');
    if (!name || !surname || !email || !password) {
      setErrorMessage('Lütfen tüm alanları doldurun.');
      return;
    }

    try {
      setLoading(true);
      await signUp(email, password, name, surname);
      Alert.alert('Başarılı', 'Kayıt işlemi tamamlandı! Lütfen giriş yapın.');
      navigation.navigate('Login');
    } catch (error: any) {
      setErrorMessage(error.message || 'Kayıt Başarısız');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header Section */}
          <View style={styles.header}>
            <View style={styles.titleContainer}>
              <Text style={styles.title}>Kullanıcı Oluştur</Text>
              <View style={styles.titleUnderline} />
            </View>
          </View>

          {/* Form Card */}
          <View style={styles.card}>
            {errorMessage ? (
              <View style={styles.errorBox}>
                <MaterialCommunityIcons name="alert-circle" size={20} color={COLORS.red} />
                <Text style={styles.errorText}>{errorMessage}</Text>
              </View>
            ) : null}

            <View style={styles.inputRow}>
              <View style={[styles.inputWrapper, { flex: 1, marginRight: 10 }]}>
                <Text style={styles.inputLabel}>Ad</Text>
                <View style={styles.inputContainer}>
                <TextInput
                  placeholder="Adınız"
                  value={name}
                  onChangeText={setName}
                  style={styles.input}
                  placeholderTextColor="#A0AEC0"
                  underlineColorAndroid="transparent"
                />
                </View>
              </View>
              <View style={[styles.inputWrapper, { flex: 1 }]}>
                <Text style={styles.inputLabel}>Soyad</Text>
                <View style={styles.inputContainer}>
                <TextInput
                  placeholder="Soyadınız"
                  value={surname}
                  onChangeText={setSurname}
                  style={styles.input}
                  placeholderTextColor="#A0AEC0"
                  underlineColorAndroid="transparent"
                />
                </View>
              </View>
            </View>

            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>E-posta</Text>
              <View style={styles.inputContainer}>
                <MaterialCommunityIcons name="email-outline" size={20} color={COLORS.textSecondary} style={styles.inputIcon} />
                <TextInput
                  placeholder="E-posta adresiniz"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  style={styles.input}
                  placeholderTextColor="#A0AEC0"
                  underlineColorAndroid="transparent"
                />
              </View>
            </View>

            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Şifre</Text>
              <View style={styles.inputContainer}>
                <MaterialCommunityIcons name="lock-outline" size={20} color={COLORS.textSecondary} style={styles.inputIcon} />
                <TextInput
                  placeholder="Şifreniz"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  style={styles.input}
                  placeholderTextColor="#A0AEC0"
                  underlineColorAndroid="transparent"
                />
              </View>
            </View>

            <TouchableOpacity 
              style={[styles.registerButton, loading && { opacity: 0.7 }]} 
              onPress={handleRegister}
              disabled={loading}
            >
              <Text style={styles.registerButtonText}>
                {loading ? 'Hesap Oluşturuluyor...' : 'Devam Et'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Zaten hesabınız var mı?</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.loginLink}>Giriş Yapın</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 40,
    justifyContent: 'center',
  },
  header: {
    marginBottom: 40,
    alignItems: 'center',
  },
  titleContainer: {
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.text,
    letterSpacing: -0.5,
  },
  titleUnderline: {
    width: '100%',
    height: 4,
    backgroundColor: COLORS.indigo,
    borderRadius: 2,
    marginTop: 10,
  },
  card: {
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
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF5F5',
    padding: 12,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#FED7D7',
  },
  errorText: {
    color: COLORS.red,
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 8,
    flex: 1,
  },
  inputRow: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  inputWrapper: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 8,
    marginLeft: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
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
    fontSize: 15,
    color: COLORS.text,
    fontWeight: '500',
    ...Platform.select({
      web: {
        outlineStyle: 'none',
      } as any,
    }),
  },
  registerButton: {
    backgroundColor: COLORS.indigo,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    shadowColor: COLORS.indigo,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  registerButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 30,
  },
  footerText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  loginLink: {
    fontSize: 14,
    color: COLORS.indigo,
    fontWeight: '700',
    marginLeft: 6,
  },
});
