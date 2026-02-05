import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../utils/config'; // your axios instance

export default function OffersScreen({ navigation }) {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOffers();
  }, []);

  const fetchOffers = async () => {
    try {
      const res = await api.get('/api/offers'); // example endpoint
      setOffers(res.data);
    } catch (err) {
      console.error('Error fetching offers:', err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#FF6347" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>🔥 Today’s Offers</Text>

      {offers.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="pricetags-outline" size={70} color="gray" />
          <Text style={styles.emptyText}>No offers available right now.</Text>
        </View>
      ) : (
        offers.map((offer, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => navigation.navigate('Product', { id: offer.productId })}
            style={styles.card}
          >
            <Image source={{ uri: offer.image }} style={styles.image} resizeMode="cover" />
            <View style={styles.cardInfo}>
              <View style={styles.row}>
                <Text style={styles.offerTitle}>{offer.title}</Text>
                <Text style={styles.discountText}>{offer.discount}% OFF</Text>
              </View>
              <Text style={styles.description}>{offer.description}</Text>
            </View>
          </TouchableOpacity>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  loaderContainer: {
    flex: 1,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 16,
    color: '#111827',
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 100,
  },
  emptyText: {
    color: '#6B7280',
    marginTop: 8,
    fontSize: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 180,
  },
  cardInfo: {
    padding: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  offerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  discountText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FF6347',
  },
  description: {
    marginTop: 6,
    color: '#6B7280',
    fontSize: 14,
  },
});
