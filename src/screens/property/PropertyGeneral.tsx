import React, { useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
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
  QrCode,
  Utensils
} from "lucide-react-native";
import QRCode from 'react-native-qrcode-svg'; 
import { SafeAreaView } from 'react-native-safe-area-context'; 

// Import the new, separated logic and styles
import { fetchPropertyGeneralData } from "../../services/Property";
import { propertyGeneralStyles as styles } from "../../styles/propertyGeneralStyles";
import { PALETTE } from "../../styles/palette";
import type { PropertyGeneral } from "../../types";

const { width } = Dimensions.get("window");

type DisciplineGroup = {
  [discipline: string]: {
    [specKey: string]: {
      specifications: Record<string, any>;
      locations: {
        spaceName: string;
        assetDescription: string;
      }[];
    };
  };
};


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

  const disciplineData = useMemo<DisciplineGroup>(() => {
    if (!property?.Spaces) return {};

    const groups: DisciplineGroup = {};

    property.Spaces.forEach(space => {
      space.Assets?.forEach(asset => {
        const discipline = asset.AssetTypes?.discipline || 'General';
        const latestLog = asset.ChangeLog
          ?.filter(log => log.status === 'ACCEPTED')
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];
        
        const specifications = latestLog?.specifications || {};
        
        // Skip assets that have no specifications
        if (Object.keys(specifications).length === 0) {
            return;
        }

        // Sort keys to create a consistent, unique key from the spec object
        const sortedSpec = Object.keys(specifications).sort().reduce(
          (obj, key) => { 
            obj[key] = specifications[key]; 
            return obj;
          }, 
          {} as Record<string, any>
        );
        const specKey = JSON.stringify(sortedSpec);

        if (!groups[discipline]) {
          groups[discipline] = {};
        }
        if (!groups[discipline][specKey]) {
          groups[discipline][specKey] = {
            specifications: specifications,
            locations: [],
          };
        }

        groups[discipline][specKey].locations.push({
          spaceName: space.name,
          assetDescription: asset.description,
        });
      });
    });

    return groups;
  }, [property]);

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
    // Only show these types, in this order
    const statTypes = [
      { key: 'bedroom', label: 'Bedrooms', icon: <Bed color={PALETTE.primary} size={20} /> },
      { key: 'bathroom', label: 'Bathrooms', icon: <Bath color={PALETTE.primary} size={20} /> },
      { key: 'kitchen', label: 'Kitchens', icon: <Utensils color={PALETTE.primary} size={20} /> },
      { key: 'living', label: 'Living Rooms', icon: <HomeIcon color={PALETTE.primary} size={20} /> },
      { key: 'garage', label: 'Garages', icon: <Car color={PALETTE.primary} size={20} /> },
    ];
    // Only use allowed keys from spaceCounts
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
    // if (property?.block_size) {
    //   stats.push({
    //     icon: <Maximize color={PALETTE.primary} size={20} />,
    //     label: "Block Size",
    //     value: `${property.block_size} m²`,
    //   });
    // }
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
      {/* Header */}
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
        {/* Image Section */}
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
          <Text style={styles.propertyName}>{property?.name}</Text>
          <Text style={styles.propertyAddress}>{property?.address}</Text>
          
          {/* Property Details Card */}
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

          {/* Description Card */}
          {property?.description && (
            <View style={styles.detailsCard}>
              <Text style={styles.cardTitle}>Description</Text>
              <Text style={styles.descriptionText}>{property.description}</Text>
            </View>
          )}
          
          {/* QR Code Card */}
          {propertyId && (
            <View style={styles.detailsCard}>
              <View style={styles.cardHeader}>
                 <QrCode size={20} color={PALETTE.textPrimary} />
                 <Text style={styles.cardTitleWithIcon}>Property QR Code</Text>
              </View>
              <View style={styles.qrCodeContainer}>
                 <QRCode
                    value={propertyId}
                    size={180}
                    color={PALETTE.textPrimary}
                    backgroundColor="white"
                 />
              </View>
              <Text style={styles.qrCodeDescription}>
                Scan this code to quickly access property details.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default PropertyGeneralScreen;