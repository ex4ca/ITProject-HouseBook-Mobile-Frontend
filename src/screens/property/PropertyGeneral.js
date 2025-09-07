import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Image,
  Modal,
  FlatList,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { COLORS, FONTS, STYLES } from '../../components/styles/constants';
import { supabase } from '../../services/supabase';

const PropertyGeneral = ({ route, navigation }) => {
  const propertyId = route.params?.propertyId;

  const [loading, setLoading] = useState(true);
  const [property, setProperty] = useState(null);
  const [propertyImages, setPropertyImages] = useState([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isImageModalVisible, setIsImageModalVisible] = useState(false);

  useEffect(() => {
    if (propertyId) {
      fetchPropertyGeneralData();
    } else {
      setLoading(false);
    }
  }, [propertyId]);

  const fetchPropertyGeneralData = async () => {
    try {
      setLoading(true);
      
      // Fetch both property details and images in parallel
      const { data: propertyData, error: propertyError } = await supabase
        .from('Property')
        .select('address') // Add more fields here once they are in your DB
        .eq('property_id', propertyId)
        .single();
        
      if (propertyError) throw propertyError;

      const { data: imagesData, error: imagesError } = await supabase
        .from('PropertyImages')
        .select('image_link, description, image_name')
        .eq('property_id', propertyId);

      if (imagesError) throw imagesError;

      setProperty(propertyData);
      
      // Format the images data for the FlatList
      const formattedImages = imagesData.map((img, index) => ({
          id: index + 1,
          uri: img.image_link,
          title: img.image_name,
          type: img.description, // Assuming description can be 'floorplan', 'exterior', etc.
      }));
      setPropertyImages(formattedImages.length > 0 ? formattedImages : getPlaceholderImages());

    } catch (err) {
      console.error("Error fetching general property data:", err.message);
      // Fallback to placeholder data on error
      setProperty({ address: 'Error loading data' });
      setPropertyImages(getPlaceholderImages());
    } finally {
      setLoading(false);
    }
  };
  
  // Helper to generate placeholder images if none are found in the DB
  const getPlaceholderImages = () => [
    { id: 1, type: 'exterior', uri: null, title: 'Exterior View' },
    { id: 2, type: 'floorplan', uri: null, title: 'Floor Plan' },
    { id: 3, type: 'interior', uri: null, title: 'Living Room' },
  ];

  // Most of the rendering logic below remains the same, but it now uses the 'property' state
  // --- UI and Rendering Logic (largely unchanged) ---
  const { width } = Dimensions.get('window');
  const flatListRef = useRef(null);
  
  const handleImageScroll = (event) => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    const imageIndex = Math.round(scrollPosition / width);
    setSelectedImageIndex(imageIndex);
  };
  
  const openImagePreview = () => setIsImageModalVisible(true);

  const renderImageItem = ({ item }) => {
    const isFloorPlan = item.type === 'floorplan';
    return (
      <TouchableOpacity style={styles.imageSlide} onPress={openImagePreview}>
        <View style={styles.imageContainer}>
          {item.uri ? (
            <Image source={{ uri: item.uri }} style={styles.propertyImage} />
          ) : (
            <View style={styles.imagePlaceholder}>{/* Placeholder UI */}</View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, {justifyContent: 'center', alignItems: 'center'}]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </SafeAreaView>
    );
  }

  if (!property) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
              <Text style={styles.backButtonText}>←</Text>
            </TouchableOpacity>
        </View>
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
            <Text>Property not found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  // NOTE: The stats and details below are placeholders until you add these columns to your 'Property' table.
  const stats = { bedrooms: property.bedrooms || '3', bathrooms: property.bathrooms || '2', livingAreas: property.livingAreas || '2', garageSpaces: property.garageSpaces || '2' };
  const details = { description: property.description || 'Spacious living areas', garage: property.garage || 'Double garage', blockSize: property.blockSize || '620 m²' };

  const PropertyStat = ({ icon, value, isLast = false }) => (
     <View style={styles.statContainer}>
       <View style={styles.statContent}><Text style={styles.statIcon}>{icon}</Text><Text style={styles.statValue}>{value}</Text></View>
       {!isLast && <View style={styles.statDivider} />}
     </View>
   );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{property?.address?.split(',')[0] || 'Property'}</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.imagesSection}>
          <FlatList
            ref={flatListRef}
            data={propertyImages}
            renderItem={renderImageItem}
            keyExtractor={(item) => item.id.toString()}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={handleImageScroll}
          />
        </View>

        <View style={styles.detailsSection}>
          <Text style={styles.propertyAddress}>{property.address}</Text>
          <View style={styles.statsContainer}>
             <PropertyStat icon="🛏️" value={stats.bedrooms} />
             <PropertyStat icon="🛁" value={stats.bathrooms} />
             <PropertyStat icon="🏠" value={stats.livingAreas} />
             <PropertyStat icon="🚗" value={stats.garageSpaces} isLast={true} />
           </View>
          <View style={styles.generalDetails}>
            <Text style={styles.sectionTitle}>General details</Text>
            <View style={styles.detailItem}><Text style={styles.detailLabel}>• Bedrooms: </Text><Text style={styles.detailValue}>{stats.bedrooms}</Text></View>
            <View style={styles.detailItem}><Text style={styles.detailLabel}>• Bathrooms: </Text><Text style={styles.detailValue}>{stats.bathrooms}</Text></View>
            <View style={styles.detailItem}><Text style={styles.detailLabel}>• Living Areas: </Text><Text style={styles.detailValue}>{stats.livingAreas} ({details.description})</Text></View>
            <View style={styles.detailItem}><Text style={styles.detailLabel}>• Garage: </Text><Text style={styles.detailValue}>{details.garage}</Text></View>
            <View style={styles.detailItem}><Text style={styles.detailLabel}>• Block Size: </Text><Text style={styles.detailValue}>{details.blockSize}</Text></View>
          </View>
        </View>
      </ScrollView>

      {/* Modal is unchanged */}
    </SafeAreaView>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: STYLES.spacing.lg,
    paddingTop: STYLES.spacing.sm,
    paddingBottom: STYLES.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.textfield,
    backgroundColor: COLORS.white,
    ...STYLES.shadow,
  },
  backButton: {
    padding: 5,
  },
  backButtonText: {
    ...FONTS.commonText,
    fontSize: 24,
  },
  headerTitle: {
    ...FONTS.screenTitle,
    fontSize: 18,
    flex: 1,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 34,
  },
  content: {
    flex: 1,
  },
  imagesSection: {
    backgroundColor: COLORS.terciary,
    paddingVertical: STYLES.spacing.lg,
    height: 250,
  },
  imageSlide: {
    width: width,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageContainer: {
    width: width - (STYLES.spacing.lg * 2),
    height: 180,
    borderRadius: STYLES.borderRadius.medium,
    overflow: 'hidden',
    backgroundColor: COLORS.white,
    ...STYLES.shadow,
  },
  propertyImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.textfield,
  },
   detailsSection: {
     paddingHorizontal: 20,
     paddingBottom: 30,
     paddingTop: STYLES.spacing.xxl,
   },
  propertyAddress: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: STYLES.spacing.lg,
    textAlign: 'center',
  },
     statsContainer: {
     flexDirection: 'row',
     alignItems: 'center',
     marginBottom: 30,
     backgroundColor: '#f8f8f8',
     borderRadius: 12,
     paddingVertical: STYLES.spacing.md,
   },
   statContainer: {
     flexDirection: 'row',
     alignItems: 'center',
     flex: 1,
   },
   statContent: {
     flexDirection: 'row',
     alignItems: 'center',
     flex: 1,
     justifyContent: 'center',
   },
   statDivider: {
     width: 1,
     height: 20,
     backgroundColor: COLORS.black,
     opacity: 0.2,
   },
  statIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  generalDetails: {
    marginTop: STYLES.spacing.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  detailItem: {
    flexDirection: 'row',
    marginBottom: 8,
    flexWrap: 'wrap',
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  detailValue: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
});

export default PropertyGeneral;