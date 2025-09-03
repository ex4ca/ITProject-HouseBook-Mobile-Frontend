import React, { useState, useRef } from 'react';
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
  PanGestureHandler,
} from 'react-native';
import { COLORS, FONTS, STYLES } from '../../components/styles/constants';
import { mockProperties } from '../../constants/mockData';

const PropertyGeneral = ({ route, navigation }) => {
  const { property } = route?.params || { property: mockProperties[0] };
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isImageModalVisible, setIsImageModalVisible] = useState(false);

  // Mock property images with multiple images
  const propertyImages = [
    { id: 1, type: 'exterior', uri: null, title: 'Exterior View' },
    { id: 2, type: 'floorplan', uri: null, title: 'Floor Plan' },
    { id: 3, type: 'interior', uri: null, title: 'Living Room' },
    { id: 4, type: 'interior', uri: null, title: 'Kitchen' },
    { id: 5, type: 'interior', uri: null, title: 'Bedroom' },
  ];

  // Create infinite sliding data for preview mode
  const infiniteImages = [
    propertyImages[propertyImages.length - 1], // Last image at start for cycle
    ...propertyImages,
    propertyImages[0], // First image at end for cycle
  ];

  const { width } = Dimensions.get('window');
  const flatListRef = useRef(null);
  const previewFlatListRef = useRef(null);

  // Handle image swipe navigation
  const handleImageScroll = (event) => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    const imageIndex = Math.round(scrollPosition / width);
    setSelectedImageIndex(imageIndex);
  };

  // Navigate to specific image
  const goToImage = (index) => {
    flatListRef.current?.scrollToIndex({
      index,
      animated: true,
    });
    setSelectedImageIndex(index);
  };

  // Handle preview scroll with infinite cycle
  const handlePreviewScroll = (event) => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    const imageIndex = Math.round(scrollPosition / width);
    
    // Calculate the real image index (accounting for the prepended image)
    let realIndex = imageIndex - 1;
    
    // Handle infinite scrolling logic
    if (imageIndex === 0) {
      // At fake last image, set to real last image
      realIndex = propertyImages.length - 1;
      setSelectedImageIndex(realIndex);
      // Jump to real last image position
      setTimeout(() => {
        previewFlatListRef.current?.scrollToIndex({
          index: propertyImages.length,
          animated: false,
        });
      }, 50);
    } else if (imageIndex === infiniteImages.length - 1) {
      // At fake first image, set to real first image
      realIndex = 0;
      setSelectedImageIndex(realIndex);
      // Jump to real first image position
      setTimeout(() => {
        previewFlatListRef.current?.scrollToIndex({
          index: 1,
          animated: false,
        });
      }, 50);
    } else {
      // Normal scrolling - update the selected index
      setSelectedImageIndex(realIndex);
    }
  };

  // Open image preview modal
  const openImagePreview = () => {
    setIsImageModalVisible(true);
  };

  // Render individual image item
  const renderImageItem = ({ item, index }) => {
    const isFloorPlan = item.type === 'floorplan';
    
    return (
      <TouchableOpacity
        style={styles.imageSlide}
        onPress={openImagePreview}
      >
        <View style={styles.imageContainer}>
          {item.uri ? (
            <Image source={{ uri: item.uri }} style={styles.propertyImage} />
          ) : (
            <View style={styles.imagePlaceholder}>
              {isFloorPlan ? (
                // Floor plan representation
                <View style={styles.floorPlan}>
                  <View style={styles.room}>
                    <Text style={styles.roomText}>Bed</Text>
                  </View>
                  <View style={styles.room}>
                    <Text style={styles.roomText}>Bath</Text>
                  </View>
                  <View style={styles.room}>
                    <Text style={styles.roomText}>Living</Text>
                  </View>
                  <View style={styles.room}>
                    <Text style={styles.roomText}>Kitchen</Text>
                  </View>
                  <View style={styles.room}>
                    <Text style={styles.roomText}>Garage</Text>
                  </View>
                </View>
              ) : (
                <View style={styles.imagePlaceholderContent}>
                  <Text style={styles.imagePlaceholderText}>📷</Text>
                  <Text style={styles.imageTitle}>{item.title}</Text>
                </View>
              )}
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

     const PropertyStat = ({ icon, value, isLast = false }) => (
     <View style={styles.statContainer}>
       <View style={styles.statContent}>
         <Text style={styles.statIcon}>{icon}</Text>
         <Text style={styles.statValue}>{value}</Text>
       </View>
       {!isLast && <View style={styles.statDivider} />}
     </View>
   );

  return (
    <SafeAreaView style={styles.container}>
                   {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.navigate('Properties')}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{property?.address.split(',')[0]}</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Property Images Gallery */}
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
            bounces={false}
          />
        </View>

        {/* Property Details */}
        <View style={styles.detailsSection}>
          <Text style={styles.propertyType}>{property.type}</Text>
          <Text style={styles.propertyAddress}>{property.address}</Text>
          <Text style={styles.propertySize}>{property.size}</Text>

                     {/* Property Stats */}
           <View style={styles.statsContainer}>
             <PropertyStat icon="🛏️" value={property.bedrooms} />
             <PropertyStat icon="🛁" value={property.bathrooms} />
             <PropertyStat icon="🏠" value={property.livingAreas} />
             <PropertyStat icon="🚗" value={property.garageSpaces} isLast={true} />
           </View>

          {/* General Details */}
          <View style={styles.generalDetails}>
            <Text style={styles.sectionTitle}>General details</Text>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>• Bedrooms: </Text>
              <Text style={styles.detailValue}>{property.bedrooms}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>• Bathrooms: </Text>
              <Text style={styles.detailValue}>{property.bathrooms}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>• Living Areas: </Text>
              <Text style={styles.detailValue}>{property.livingAreas} ({property.description})</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>• Garage: </Text>
              <Text style={styles.detailValue}>{property.garage}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>• Block Size: </Text>
              <Text style={styles.detailValue}>{property.blockSize}</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Full-Screen Image Preview Modal */}
      <Modal
        visible={isImageModalVisible}
        transparent={false}
        animationType="fade"
        onRequestClose={() => setIsImageModalVisible(false)}
      >
        <View style={styles.previewContainer}>
          {/* Close button */}
          <TouchableOpacity
            style={styles.previewCloseButton}
            onPress={() => setIsImageModalVisible(false)}
          >
            <Text style={styles.previewCloseText}>✕</Text>
          </TouchableOpacity>
          
          {/* Full-screen image gallery with infinite scrolling */}
          <FlatList
            ref={previewFlatListRef}
            data={infiniteImages}
            renderItem={({ item, index }) => {
              const isFloorPlan = item.type === 'floorplan';
              return (
                <View style={styles.previewImageContainer}>
                  {item.uri ? (
                    <Image source={{ uri: item.uri }} style={styles.previewImage} />
                  ) : (
                    <View style={styles.previewImagePlaceholder}>
                      {isFloorPlan ? (
                        <View style={styles.previewFloorPlan}>
                          <View style={styles.previewRoom}>
                            <Text style={styles.previewRoomText}>Bedroom</Text>
                          </View>
                          <View style={styles.previewRoom}>
                            <Text style={styles.previewRoomText}>Bathroom</Text>
                          </View>
                          <View style={styles.previewRoom}>
                            <Text style={styles.previewRoomText}>Living</Text>
                          </View>
                          <View style={styles.previewRoom}>
                            <Text style={styles.previewRoomText}>Kitchen</Text>
                          </View>
                          <View style={styles.previewRoom}>
                            <Text style={styles.previewRoomText}>Garage</Text>
                          </View>
                        </View>
                      ) : (
                        <View style={styles.previewPlaceholderContent}>
                          <Text style={styles.previewPlaceholderIcon}>📷</Text>
                          <Text style={styles.previewPlaceholderTitle}>{item.title}</Text>
                        </View>
                      )}
                    </View>
                  )}
                </View>
              );
            }}
            keyExtractor={(item, index) => `${item.id}-${index}`}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            initialScrollIndex={selectedImageIndex + 1} // +1 because of prepended image
            getItemLayout={(data, index) => ({
              length: width,
              offset: width * index,
              index,
            })}
            onMomentumScrollEnd={handlePreviewScroll}
          />
          
          {/* Bottom indicators */}
          <View style={styles.previewIndicators}>
            {propertyImages.map((_, index) => {
              const isActive = selectedImageIndex === index;
              return (
                <View
                  key={index}
                  style={[
                    styles.previewIndicator,
                    isActive && styles.previewActiveIndicator
                  ]}
                />
              );
            })}
          </View>
        </View>
      </Modal>
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
    width: 34, // Same width as back button to center the title
  },
  content: {
    flex: 1,
  },
  // Image Gallery Section
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
  floorPlanContainer: {
    height: 250,
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
  imagePlaceholderContent: {
    alignItems: 'center',
  },
  imagePlaceholderText: {
    fontSize: 32,
    marginBottom: STYLES.spacing.sm,
  },
  imageTitle: {
    ...FONTS.hintText,
    fontSize: 14,
  },
  
  // Image Indicators
  imageIndicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: STYLES.spacing.md,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.secondary,
    marginHorizontal: 4,
  },
  activeIndicator: {
    backgroundColor: COLORS.primary,
  },
  floorPlanPlaceholder: {
    backgroundColor: '#f8f8f8',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  floorPlan: {
    width: '90%',
    height: '90%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#333',
    backgroundColor: '#fff',
  },
  room: {
    borderWidth: 1,
    borderColor: '#333',
    padding: 8,
    margin: 2,
    minWidth: 60,
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
  },
  roomText: {
    fontSize: 10,
    fontWeight: '500',
    color: '#333',
  },
     detailsSection: {
     paddingHorizontal: 20,
     paddingBottom: 30,
     paddingTop: STYLES.spacing.xxl, // Big margin from image section
   },
   propertyType: {
     fontSize: 16,
     color: '#666',
     marginBottom: 5,
   },
  propertyAddress: {
    fontSize: 14,
    color: '#999',
    marginBottom: 5,
  },
     propertySize: {
     fontSize: 24,
     fontWeight: 'bold',
     color: '#333',
     marginBottom: STYLES.spacing.sm, // Reduced margin before icons
   },
     statsContainer: {
     flexDirection: 'row',
     alignItems: 'center',
     marginBottom: 30,
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
     marginHorizontal: STYLES.spacing.sm,
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
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    padding: 20,
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
  // Full-Screen Preview Styles
  previewContainer: {
    flex: 1,
    backgroundColor: COLORS.terciary,
  },
  previewCloseButton: {
    position: 'absolute',
    top: 50,
    right: STYLES.spacing.lg,
    zIndex: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewCloseText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
  previewImageContainer: {
    flex: 1,
    width: width,
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewImage: {
    width: width * 0.9,
    height: '80%',
    resizeMode: 'contain',
  },
  previewImagePlaceholder: {
    width: width * 0.9,
    height: '80%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: STYLES.borderRadius.medium,
  },
  previewFloorPlan: {
    width: '90%',
    height: '90%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.black,
    backgroundColor: COLORS.white,
  },
  previewRoom: {
    borderWidth: 1,
    borderColor: COLORS.black,
    padding: STYLES.spacing.md,
    margin: STYLES.spacing.xs,
    minWidth: 80,
    alignItems: 'center',
    backgroundColor: COLORS.textfield,
  },
  previewRoomText: {
    ...FONTS.smallText,
    fontSize: 10,
  },
  previewPlaceholderContent: {
    alignItems: 'center',
  },
  previewPlaceholderIcon: {
    fontSize: 60,
    marginBottom: STYLES.spacing.lg,
  },
  previewPlaceholderTitle: {
    ...FONTS.commonText,
    fontSize: 18,
  },
  previewIndicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    position: 'absolute',
    bottom: 50,
    alignSelf: 'center',
  },
  previewIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.secondary,
    marginHorizontal: 6,
  },
  previewActiveIndicator: {
    backgroundColor: COLORS.primary,
  },

});

export default PropertyGeneral;
