import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Dimensions,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import CustomText from '@/components/shared/CustomText';
import { useDriverStore } from '@/store/driverStore';
import { loginDriver } from '@/service/driver';
import { tokenStorage } from '@/store/storage';
import { Colors } from '@/utils/Constants';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const DriverAuthScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { setUser, setLoading, setError, isLoading, error } = useDriverStore();

  const validateInput = () => {
    if (!email || !password) {
      setError('Please fill in all fields');
      return false;
    }

    if (!email.includes('@')) {
      setError('Please enter a valid email');
      return false;
    }

    return true;
  };

  const handleLogin = async () => {
    if (!validateInput()) return;

    setError(null);
    setLoading(true);

    try {
      const response = await loginDriver({
        email,
        password
      });

      if (response.access_token && response.refresh_token && response.user) {
        setUser(response.user);
        await tokenStorage.set('access_token', response.access_token);
        await tokenStorage.set('refresh_token', response.refresh_token);
        await tokenStorage.set('user_role', 'driver');
        
        Alert.alert(
          'Success',
          'Login successful! Welcome to SmartBus.',
          [
            {
              text: 'OK',
              onPress: () => router.replace('/(driver)/home' as any)
            }
          ]
        );
      } else {
        setError('Invalid response from server. Please try again.');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Network error. Please check your connection and try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardContainer}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.logoContainer}>
            <Image
              source={require('@/assets/images/logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
            <CustomText style={styles.welcomeText}>Welcome Driver!</CustomText>
            <CustomText style={styles.subtitle}>
              Sign in to start your journey
            </CustomText>
          </View>

          <View style={styles.formContainer}>
            <View style={styles.inputContainer}>
              <Ionicons name="mail-outline" size={20} color="#666" style={styles.inputIcon} />
              <View style={styles.inputWrapper}>
                <CustomText style={styles.label}>Email</CustomText>
                <View style={styles.input}>
                  <TextInput
                    style={styles.inputText}
                    onChangeText={setEmail}
                    value={email}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                    placeholder="Enter your email"
                    placeholderTextColor="#999"
                    editable={!isLoading}
                  />
                </View>
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.inputIcon} />
              <View style={styles.inputWrapper}>
                <CustomText style={styles.label}>Password</CustomText>
                <View style={styles.input}>
                  <TextInput
                    style={styles.inputText}
                    onChangeText={setPassword}
                    value={password}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoComplete="password"
                    placeholder="Enter your password"
                    placeholderTextColor="#999"
                    editable={!isLoading}
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    style={styles.eyeIcon}
                    disabled={isLoading}
                  >
                    <Ionicons
                      name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                      size={20}
                      color="#666"
                    />
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {error && (
              <CustomText style={styles.errorText}>{error}</CustomText>
            )}

            <TouchableOpacity
              style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
              onPress={handleLogin}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <CustomText style={styles.loginButtonText}>Sign In</CustomText>
              )}
            </TouchableOpacity>

            <View style={styles.helpContainer}>
              <CustomText style={styles.helpText}>
                Need help? Contact your administrator
              </CustomText>
              <TouchableOpacity onPress={() => {}}>
                <CustomText style={styles.contactText}>
                  support@smartbus.com
                </CustomText>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 24,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 48,
    marginBottom: 32,
  },
  logo: {
    width: width * 0.4,
    height: width * 0.4,
    marginBottom: 16,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  formContainer: {
    paddingHorizontal: 24,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  inputIcon: {
    marginRight: 12,
  },
  inputWrapper: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  input: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingVertical: 8,
  },
  inputText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    padding: 0,
  },
  eyeIcon: {
    padding: 4,
  },
  errorText: {
    color: Colors.error,
    fontSize: 14,
    marginBottom: 16,
    textAlign: 'center',
  },
  loginButton: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 24,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  helpContainer: {
    alignItems: 'center',
    marginTop: 24,
  },
  helpText: {
    color: '#666',
    fontSize: 14,
    marginBottom: 4,
  },
  contactText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '500',
  },
});

export default DriverAuthScreen; 