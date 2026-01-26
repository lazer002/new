import { useEffect } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';

export default function SplashScreen({ navigation }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace('Auth'); // go to Auth after 2.5s
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <Image
        source={{ uri: 'https://via.placeholder.com/150x150?text=Logo' }}
        style={{ width: 120, height: 120, marginBottom: 20 }}
      />
      <Text style={styles.title}>Clothify</Text>
      <Text style={styles.subtitle}>Your Fashion, Your Style</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FF6347' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#fff' },
  subtitle: { fontSize: 14, color: '#fff', marginTop: 8 },
});
