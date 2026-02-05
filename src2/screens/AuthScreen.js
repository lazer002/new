import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/config';

export default function AuthScreen({ navigation }) {
  const { promptGoogleLogin } = useAuth(); // ✅ AuthContext
  const [email, setEmail] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [loading, setLoading] = useState(false);

  // Email OTP login
  const handleContinue = async () => {
    if (!email) return Alert.alert('Error', 'Please enter your email');

    try {
      setLoading(true);
      const res = await api.post(`/api/auth/otp/send`, { email });

      if (res.status === 200) {
        Alert.alert('OTP Sent', 'Check your email for the OTP');
        navigation.navigate('OtpVerification', { email });
      } else {
        Alert.alert('Error', res.data?.error || 'Failed to send OTP');
      }
    } catch (err) {
      Alert.alert('Error', err.response?.data?.error || 'Something went wrong. Try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Google login button

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Welcome Back</Text>
      <Text style={styles.subHeading}>Login quickly to continue</Text>

      {/* Email Input */}
      <View style={[styles.inputWrapper, { borderColor: isFocused ? '#000' : '#ddd' }]}>
        <Ionicons name="mail-outline" size={22} color="#000" style={{ marginRight: 10 }} />
        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="Enter your email"
          keyboardType="email-address"
          autoCapitalize="none"
          style={styles.input}
          placeholderTextColor="#888"
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
      </View>

      {/* Continue Button */}
      <TouchableOpacity style={styles.loginButton} onPress={handleContinue} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.loginButtonText}>Continue</Text>}
      </TouchableOpacity>

      <Text style={styles.orText}>OR</Text>

      {/* Google Login */}
      <TouchableOpacity
        style={styles.googleButton}
        onPress={async () => await promptGoogleLogin()}
        disabled={loading}
      >
        <MaterialCommunityIcons name="google" size={22} color="#fff" style={{ marginRight: 12 }} />
        <Text style={styles.googleButtonText}>Login with Google</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 24, paddingTop: 100, backgroundColor: '#fff', alignItems: 'center' },
  heading: { fontSize: 30, fontWeight: '700', textAlign: 'center', color: '#000', marginBottom: 6 },
  subHeading: { fontSize: 16, textAlign: 'center', color: '#444', marginBottom: 36 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderRadius: 14, paddingHorizontal: 14, backgroundColor: '#fff', width: '100%', height: 52, marginBottom: 20, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5, elevation: 3 },
  input: { flex: 1, height: 50, fontSize: 16, color: '#000' },
  loginButton: { flexDirection: 'row', justifyContent: 'center', backgroundColor: '#000', paddingVertical: 14, paddingHorizontal: 20, borderRadius: 12, width: '100%', alignItems: 'center', marginBottom: 16, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 5, elevation: 4 },
  loginButtonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  orText: { fontSize: 14, color: '#888', marginVertical: 10 },
  googleButton: { flexDirection: 'row', justifyContent: 'center', backgroundColor: '#444', paddingVertical: 14, paddingHorizontal: 20, borderRadius: 12, width: '100%', alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 5, elevation: 3 },
  googleButtonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
});