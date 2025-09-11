import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Image,
  FlatList,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { supabase } from '../../api/supabaseClient';
import { ChevronLeft, Bed, Bath, Home as HomeIcon, Maximize, Square, Car } from 'lucide-react-native';

// Consistent color palette for the Notion-like design.
const PALETTE = {
  background: '#F8F9FA',
  card: '#FFFFFF',
  textPrimary: '#111827',
  textSecondary: '#6B7280',
  primary: '#111827',
  border: '#E5E7EB',
};

const { width } = Dimensions.get('window');

// Main screen component for the "General" property tab.
const PropertyGeneralScreen = ({ route, navigation }) => {
  const { propertyId } = route.params || {};

  const [loading, setLoading] = useState(true);
  const [property, setProperty] = useState(null);
  const [propertyImages, setPropertyImages] = useState([]);
  const [spaceCounts, setSpaceCounts] = useState({});

  useFocusEffect(
    useCallback(() => {
      if (propertyId) {
        fetchPropertyGeneralData();
      } else {
        setLoading(false);
      }
    }, [propertyId])
  );

  const fetchPropertyGeneralData = async () => {
    setLoading(true);
    try {
      // Fetches property details, including its spaces and images.
      const { data: propertyData, error: propertyError } = await supabase
        .from('Property')
        .select(`
          name,
          address,
          description,
          total_floor_area,
          Spaces ( type ),
          PropertyImages ( image_link, image_name )
        `)
        .eq('property_id', propertyId)
        .single();
        
      if (propertyError) throw propertyError;

      if (propertyData) {
        setProperty(propertyData);
        
        // Groups spaces by type and counts them.
        const counts = (propertyData.Spaces || []).reduce((acc, space) => {
          const type = space.type.toLowerCase();
          acc[type] = (acc[type] || 0) + 1;
          return acc;
        }, {});
        setSpaceCounts(counts);

        const formattedImages = (propertyData.PropertyImages || []).map((img, index) => ({
          id: `${propertyId}-${index}`,
          uri: img.image_link,
          title: img.image_name,
        }));
        setPropertyImages(formattedImages.length > 0 ? formattedImages : getPlaceholderImages());
      }
    } catch (err) {
      console.error("Error fetching general property data:", err.message);
      setPropertyImages(getPlaceholderImages()); // Show placeholders on error
    } finally {
      setLoading(false);
    }
  };
  
  // Provides placeholder images if none exist in the database.
  const getPlaceholderImages = () => [
    { id: 'placeholder-1', uri: null, title: 'Exterior View' },
    { id: 'placeholder-2', uri: null, title: 'Interior View' },
  ];
  
  // A memoized component mapping space types to icons and labels.
  const PropertyStats = useMemo(() => {
    const iconMap = {
      bedroom: <Bed color={PALETTE.primary} size={20} />,
      bathroom: <Bath color={PALETTE.primary} size={20} />,
      kitchen: <HomeIcon color={PALETTE.primary} size={20} />, // Placeholder icon
      garage: <Car color={PALETTE.primary} size={20} />,
      living: <HomeIcon color={PALETTE.primary} size={20} />,
    };

    const stats = Object.entries(spaceCounts).map(([type, count]) => ({
      icon: iconMap[type] || <HomeIcon color={PALETTE.primary} size={20} />,
      label: `${type.charAt(0).toUpperCase() + type.slice(1)}s`,
      value: count,
    }));
    
    // Add floor area if available.
    if (property?.total_floor_area) {
      stats.push({
        icon: <Maximize color={PALETTE.primary} size={20} />,
        label: 'Floor Area',
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
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
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
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <ChevronLeft size={24} color={PALETTE.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{property?.name || 'Property'}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.imageSection}>
          <FlatList
            data={propertyImages}
            renderItem={({ item }) => (
              <View style={styles.imageSlide}>
                <Image source={{ uri: item.uri }} style={styles.propertyImage} />
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: PALETTE.card,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: PALETTE.border,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: PALETTE.textPrimary,
    textAlign: 'center',
    flex: 1,
    marginHorizontal: 8,
  },
  imageSection: {
    height: 250,
    backgroundColor: PALETTE.border,
  },
  imageSlide: {
    width: width,
    height: '100%',
  },
  propertyImage: {
    width: '100%',
    height: '100%',
  },
  detailsContainer: {
    padding: 20,
    backgroundColor: PALETTE.background,
  },
  propertyName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: PALETTE.textPrimary,
  },
  propertyAddress: {
    fontSize: 16,
    color: PALETTE.textSecondary,
    marginTop: 4,
    marginBottom: 24,
  },
  detailsCard: {
    backgroundColor: PALETTE.card,
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: PALETTE.border,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: PALETTE.textPrimary,
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '48%', // Two items per row with a small gap
    marginBottom: 16,
  },
  statTextContainer: {
    marginLeft: 12,
  },
  statLabel: {
    fontSize: 14,
    color: PALETTE.textSecondary,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
    color: PALETTE.textPrimary,
  },
  descriptionText: {
    fontSize: 16,
    color: PALETTE.textSecondary,
    lineHeight: 24,
  },
  emptyText: {
      fontSize: 16,
      color: PALETTE.textSecondary,
  },
});

export default PropertyGeneralScreen;