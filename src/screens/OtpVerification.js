import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../utils/config';
import { AuthContext } from '../context/AuthContext';

export default function OtpVerification({ route, navigation }) {
  const { email } = route.params;
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const { login } = useContext(AuthContext);

  const handleVerify = async () => {
    if (!otp) return Alert.alert('Error', 'Please enter the OTP');

    try {
      setLoading(true);
      const res = await api.post(`/api/auth/otp/verify`, { email, otp });

      // ✅ Login successful
      if (res.status === 200 && res.data?.user) {
        login(res.data.user, res.data.accessToken, res.data.refreshToken);
        navigation.replace('Tabs'); // Navigate to main app tabs
      } else {
        Alert.alert('Error', res.data?.error || 'Invalid OTP');
      }
    } catch (err) {
      Alert.alert('Error', err.response?.data?.error || 'Something went wrong. Try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      setLoading(true);
      await api.post('/api/auth/otp/send', { email });
      Alert.alert('Success', 'OTP resent to your email');
    } catch (err) {
      Alert.alert('Error', 'Failed to resend OTP');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Verify OTP</Text>
      <Text style={styles.subHeading}>
        We’ve sent a 4-digit code to <Text style={{ fontWeight: '600' }}>{email}</Text>
      </Text>

      <View style={[styles.inputWrapper, { borderColor: isFocused ? '#FF6347' : '#ddd' }]}>
        <Ionicons name="key-outline" size={24} color="#FF6347" style={{ marginRight: 10 }} />
        <TextInput
          value={otp}
          onChangeText={setOtp}
          placeholder="Enter OTP"
          keyboardType="numeric"
          maxLength={4}
          style={styles.input}
          placeholderTextColor="#999"
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
      </View>

      <TouchableOpacity style={styles.verifyButton} onPress={handleVerify} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.verifyButtonText}>Verify & Continue</Text>}
      </TouchableOpacity>

      <TouchableOpacity onPress={handleResend}>
        <Text style={styles.resendText}>Didn’t get OTP? Resend</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 24, paddingTop: 80, backgroundColor: '#fff' },
  heading: { fontSize: 28, fontWeight: 'bold', textAlign: 'center', color: '#FF6347', marginBottom: 8 },
  subHeading: { fontSize: 15, textAlign: 'center', color: '#666', marginBottom: 32 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', borderWidth: 2, borderRadius: 12, paddingHorizontal: 12, backgroundColor: '#f9f9f9', marginBottom: 20 },
  input: { flex: 1, height: 50, fontSize: 18, color: '#333', letterSpacing: 2 },
  verifyButton: { flexDirection: 'row', justifyContent: 'center', backgroundColor: '#FF6347', padding: 16, borderRadius: 12, marginBottom: 20, alignItems: 'center' },
  verifyButtonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  resendText: { textAlign: 'center', color: '#FF6347', fontWeight: '600', textDecorationLine: 'underline', fontSize: 15 },
});
