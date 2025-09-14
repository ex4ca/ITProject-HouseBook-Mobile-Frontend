import React, { useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Image,
  FlatList,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import {
  ChevronLeft,
  Bed,
  Bath,
  Home as HomeIcon,
  Maximize,
  Car,
} from "lucide-react-native";

// Import the new, separated logic and styles
import { fetchPropertyGeneralData } from "../../services/Property";
import { propertyGeneralStyles as styles } from "../../styles/propertyGeneralStyles";
import { PALETTE } from "../../styles/palette";
import type { PropertyGeneral } from "../../types";

const { width } = Dimensions.get("window");

// Define the shape of the navigation props
interface PropertyGeneralScreenProps {
  route: { params?: { propertyId?: string } };
  navigation: any;
}

const PropertyGeneralScreen = ({
  route,
  navigation,
}: PropertyGeneralScreenProps) => {
  const { propertyId } = route.params || {};

  const [loading, setLoading] = useState(true);
  const [property, setProperty] = useState<PropertyGeneral | null>(null);
  const [propertyImages, setPropertyImages] = useState<
    { id: string; uri: string | null; title: string }[]
  >([]);
  const [spaceCounts, setSpaceCounts] = useState<Record<string, number>>({});

  useFocusEffect(
    useCallback(() => {
      const loadData = async () => {
        if (propertyId) {
          setLoading(true);
          try {
            const propertyData = await fetchPropertyGeneralData(propertyId);
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

              const formattedImages = (propertyData.PropertyImages || []).map(
                (img, index) => ({
                  id: `${propertyId}-${index}`,
                  uri: img.image_link,
                  title: img.image_name,
                })
              );
              setPropertyImages(
                formattedImages.length > 0
                  ? formattedImages
                  : getPlaceholderImages()
              );
            }
          } catch (err: any) {
            console.error("Error loading general property data:", err.message);
            setPropertyImages(getPlaceholderImages());
          } finally {
            setLoading(false);
          }
        } else {
          setLoading(false);
        }
      };
      loadData();
    }, [propertyId])
  );

  const getPlaceholderImages = () => [
    { id: "placeholder-1", uri: null, title: "Exterior View" },
    { id: "placeholder-2", uri: null, title: "Interior View" },
  ];

  const PropertyStats = useMemo(() => {
    const iconMap: { [key: string]: React.ReactElement } = {
      bedroom: <Bed color={PALETTE.primary} size={20} />,
      bathroom: <Bath color={PALETTE.primary} size={20} />,
      kitchen: <HomeIcon color={PALETTE.primary} size={20} />,
      garage: <Car color={PALETTE.primary} size={20} />,
      living: <HomeIcon color={PALETTE.primary} size={20} />,
    };
    const stats = Object.entries(spaceCounts).map(([type, count]) => ({
      icon: iconMap[type] || <HomeIcon color={PALETTE.primary} size={20} />,
      label: `${type.charAt(0).toUpperCase() + type.slice(1)}s`,
      value: count.toString(),
    }));
    if (property?.total_floor_area) {
      stats.push({
        icon: <Maximize color={PALETTE.primary} size={20} />,
        label: "Floor Area",
        value: `${property.total_floor_area} m²`,
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
          {property?.name || "Property"}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.imageSection}>
          <FlatList
            data={propertyImages}
            renderItem={({ item }) => (
              <View style={styles.imageSlide}>
                <Image
                  source={{ uri: item.uri }}
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
        <View style={styles.detailsContainer}>
          <Text style={styles.propertyName}>{property.name}</Text>
          <Text style={styles.propertyAddress}>{property.address}</Text>
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
          {property.description && (
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

export default PropertyGeneralScreen;
