import React, { useState, useCallback, useMemo} from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  FlatList,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  useFocusEffect,
  useRoute,
  useNavigation,
} from "@react-navigation/native";
import {
  ChevronLeft,
} from "lucide-react-native";

import { fetchPropertyGeneralData } from "../../services/Property";
import { fetchPropertyImages } from "../../services/Image";
import { propertyGeneralStyles as styles } from "../../styles/propertyGeneralStyles";
import { PALETTE } from "../../styles/palette";
import { PropertyStatsCard } from "../../components";
import type { PropertyGeneral } from "../../types";

/**
 * A screen component that displays general overview information for a property,
 * tailored for a "Tradie" user.
 *
 * This screen provides a read-only view of essential details:
 * - Property name and address.
 * - A carousel of property images.
 * - Key statistics (bedrooms, bathrooms, floor area, etc.).
 * - Property description.
 *
 * It receives a `propertyId` from the route parameters and fetches
 * the data every time the screen comes into focus. 
 */
export default function TradiePropertyGeneral() {
  const route = useRoute();
  const navigation = useNavigation();
  const { propertyId } = route.params as { propertyId: string };
  const [loading, setLoading] = useState(true);
  const [property, setProperty] = useState<PropertyGeneral | null>(null);
  const [propertyImages, setPropertyImages] = useState<
    { id: string; uri: string }[]
  >([]);
  const [spaceCounts, setSpaceCounts] = useState<Record<string, number>>({});

  /**
   * Fetches all necessary data for the screen in parallel.
   * This includes property details and images.
   * It then processes this data to set the component's state.
   */
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
            {} as Record<string, number>,
          );
          setSpaceCounts(counts);
        }

        setPropertyImages(
          fetchedImages.map((uri, index) => ({ id: `image-${index}`, uri })),
        );
      } catch (err: any) {
        console.error(
          "Error loading general property data for tradie:",
          err.message,
        );
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
    }, [loadData]),
  );

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
            <Text style={styles.emptyText}>
              No images found for this property.
            </Text>
          )}
        </View>
        <View style={styles.detailsContainer}>
          <Text style={styles.propertyName}>{property?.name}</Text>
          <Text style={styles.propertyAddress}>{property?.address}</Text>

          <PropertyStatsCard property={property} spaceCounts={spaceCounts} />

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
}