import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  FlatList,
  Dimensions,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useRoute, useNavigation } from '@react-navigation/native';
import {
  ChevronLeft,
  Bed,
  Bath,
  Home as HomeIcon,
  Maximize,
  Car,
  Utensils,
} from 'lucide-react-native';

import { fetchPropertyGeneralData } from '../../services/Property';
import { fetchPropertyImages } from '../../services/Image';
import { propertyGeneralStyles as styles } from '../../styles/propertyGeneralStyles';
import { PALETTE } from '../../styles/palette';
import type { PropertyGeneral } from '../../types';

export default function TradiePropertyGeneral() {
  const route = useRoute();
  const navigation = useNavigation();
  const { propertyId } = route.params as { propertyId: string };
  const [loading, setLoading] = useState(true);
  const [property, setProperty] = useState<PropertyGeneral | null>(null);
  const [propertyImages, setPropertyImages] = useState<{ id: string; uri: string }[]>([]);
  const [spaceCounts, setSpaceCounts] = useState<Record<string, number>>({});


  const loadData = useCallback(async () => {
    if (propertyId) {
      setLoading(true);
      try {
        const [propertyData, fetchedImages] = await Promise.all([
          fetchPropertyGeneralData(propertyId),
          fetchPropertyImages(propertyId),
        ]);

        if (propertyData) {
          setProperty(propertyData);

          const counts = (propertyData.Spaces || []).reduce(
            (acc, space) => {
              const type = space.type.toLowerCase();
              acc[type] = (acc[type] || 0) + 1;
              return acc;
            },
            {} as Record<string, number>
          );
          setSpaceCounts(counts);
        }

        setPropertyImages(fetchedImages.map((uri, index) => ({ id: `image-${index}`, uri })));

      } catch (err: any) {
        console.error("Error loading general property data for tradie:", err.message);
        Alert.alert("Error", "Could not load property data.");
      } finally {
        setLoading(false);
      }
    } else {
      // If there's no propertyId, we shouldn't be in a loading state.
      setLoading(false);
    }
  }, [propertyId]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const PropertyStats = useMemo(() => {
      const statTypes = [
        { key: 'bedroom', label: 'Bedrooms', icon: <Bed color={PALETTE.primary} size={20} /> },
        { key: 'bathroom', label: 'Bathrooms', icon: <Bath color={PALETTE.primary} size={20} /> },
        { key: 'kitchen', label: 'Kitchens', icon: <Utensils color={PALETTE.primary} size={20} /> },
        { key: 'living', label: 'Living Rooms', icon: <HomeIcon color={PALETTE.primary} size={20} /> },
        { key: 'garage', label: 'Garages', icon: <Car color={PALETTE.primary} size={20} /> },
      ];
      const allowedKeys = statTypes.map(stat => stat.key);
      const filteredSpaceCounts = Object.fromEntries(
        Object.entries(spaceCounts).filter(([key]) => allowedKeys.includes(key))
      );
      const stats = statTypes
        .filter(stat => filteredSpaceCounts[stat.key])
        .map(stat => ({
          icon: stat.icon,
          label: stat.label,
          value: filteredSpaceCounts[stat.key]?.toString() || '0',
        }));
      if (property?.total_floor_area) {
        stats.push({
          icon: <Maximize color={PALETTE.primary} size={20} />,
          label: "Floor Area",
          value: `${property.total_floor_area} m²`,
        });
      }
      if (property?.block_size) {
        stats.push({
          icon: <Maximize color={PALETTE.primary} size={20} />,
          label: "Block Size",
          value: `${property.block_size} m²`,
        });
      }
      return stats;
    }, [spaceCounts, property]);

  if (loading) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <ActivityIndicator size="large" color={PALETTE.primary} />
      </SafeAreaView>
    );
  }

  if (!property) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <ChevronLeft size={24} color={PALETTE.textPrimary} />
          </TouchableOpacity>
        </View>
        <View style={styles.centerContainer}>
          <Text style={styles.emptyText}>Property not found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <ChevronLeft size={24} color={PALETTE.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {property?.name || "Property Overview"}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
          {/* --- IMAGE SECTION --- */}
          <View style={styles.detailsCard}>
            <Text style={styles.cardTitle}>Property Images</Text>
            {propertyImages.length > 0 ? (
              <View style={{ height: 250, marginTop: 12, borderRadius: 8 }}>
                <FlatList
                  data={propertyImages}
                  renderItem={({ item }) => (
                    <View style={[styles.imageSlide]}>
                      <Image
                        source={{ uri: item.uri! }}
                        style={styles.propertyImage}
                      />
                    </View>
                  )}
                  keyExtractor={(item) => item.id}
                  horizontal
                  pagingEnabled
                  showsHorizontalScrollIndicator={false}
                />
              </View>
            ) : (
                <Text style={styles.emptyText}>No images found for this property.</Text>
            )}
        </View>
        <View style={styles.detailsContainer}>
          <Text style={styles.propertyName}>{property?.name}</Text>
          <Text style={styles.propertyAddress}>{property?.address}</Text>
          
          <View style={styles.detailsCard}>
            <Text style={styles.cardTitle}>Property Details</Text>
            <View style={styles.statsGrid}>
              {PropertyStats.map((stat, index) => (
                <View key={index} style={styles.statItem}>
                  {stat.icon}
                  <View style={styles.statTextContainer}>
                    <Text style={styles.statLabel}>{stat.label}</Text>
                    <Text style={styles.statValue}>{stat.value}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>

          {property?.description && (
            <View style={styles.detailsCard}>
              <Text style={styles.cardTitle}>Description</Text>
              <Text style={styles.descriptionText}>{property.description}</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

