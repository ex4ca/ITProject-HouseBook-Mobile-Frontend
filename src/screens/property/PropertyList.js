import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Image,
  ActivityIndicator,
} from 'react-native';
import { Button, DropField } from '../../components/common';
import { COLORS, FONTS, STYLES } from '../../components/styles/constants';
import { supabase } from '../../services/supabase'; 
import { sortOptions } from '../../constants/mockData'; 

const PropertyList = ({ navigation, isOwner = true }) => {
  const [selectedSort, setSelectedSort] = useState('newest');
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOwner) {
      fetchOwnerProperties();
    } else {
      setLoading(false);
    }

    const subscription = supabase
      .channel('public:Property')
      .on('postgres_changes', { event: '*', schema: 'public' }, () => {
        fetchOwnerProperties();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [isOwner]);

  const fetchOwnerProperties = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user is logged in.");

      // --- FIX APPLIED HERE ---
      // Removed .single() to handle cases where multiple owner profiles might exist for a user.
      const { data, error } = await supabase
        .from('Owner')
        .select(`
          OwnerProperty (
            Property (
              property_id,
              address,
              created_at
            )
          )
        `)
        .eq('user_id', user.id);

      if (error) throw error;
      
      // The query now returns an array of owner profiles. We'll use the first one found.
      if (data && data.length > 0) {
        const ownerProfile = data[0]; // Get the first owner profile from the array
        if (ownerProfile && ownerProfile.OwnerProperty) {
          const fetchedProperties = ownerProfile.OwnerProperty.map(item => ({
            ...item.Property,
            id: item.Property.property_id,
          }));
          setProperties(fetchedProperties);
        }
      } else {
        // If no owner profile is found, set properties to an empty array.
        setProperties([]);
      }
    } catch (err) {
      console.error("Error fetching properties: ", err.message);
    } finally {
      setLoading(false);
    }
  };
  
  const getSortedProperties = () => {
    switch (selectedSort) {
      case 'oldest':
        return [...properties].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
      case 'a-z':
        return [...properties].sort((a, b) => a.address.localeCompare(b.address));
      case 'z-a':
        return [...properties].sort((a, b) => b.address.localeCompare(a.address));
      default: // 'newest'
        return [...properties].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }
  };

  const PropertyCard = ({ property }) => {
    const imageUrl = `https://placehold.co/600x400/EEE/CCC?text=${encodeURIComponent(property.address.split(',')[0])}`;
      
    return (
      <TouchableOpacity
        style={styles.propertyCard}
        onPress={() => navigation.navigate('PropertyDetails', { propertyId: property.id, isOwner })}
      >
        <View style={styles.propertyImage}>
          <Image source={{ uri: imageUrl }} style={styles.image} />
        </View>
        <View style={styles.propertyInfo}>
          <Text style={styles.propertyAddress}>{property.address}</Text>
          <Text style={styles.propertyDate}>
            Listed on: {new Date(property.created_at).toLocaleDateString()}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading Properties...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Property</Text>
        <View style={styles.sortContainer}>
          <DropField
            options={sortOptions.map(option => option.label)}
            selectedValue={sortOptions.find(option => option.value === selectedSort)?.label}
            onSelect={(selectedLabel) => {
              const option = sortOptions.find(opt => opt.label === selectedLabel);
              if (option) setSelectedSort(option.value);
            }}
            placeholder="Sort"
            style={styles.sortDropdown}
          />
        </View>
      </View>

      <ScrollView style={styles.propertyList} showsVerticalScrollIndicator={false}>
        {getSortedProperties().length > 0 ? (
          getSortedProperties().map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))
        ) : (
          <View style={styles.centerContent}>
            <Text style={styles.emptyListText}>You have no properties yet.</Text>
          </View>
        )}
      </ScrollView>

      {isOwner && (
        <Button
          text="+"
          onPress={() => navigation.navigate('PropertyEdit', { isNew: true })}
          style={styles.floatingAddButton}
          textStyle={styles.floatingAddButtonText}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: STYLES.spacing.lg,
  },
  loadingText: {
    ...FONTS.commonText,
    marginTop: STYLES.spacing.md,
  },
  emptyListText: {
    ...FONTS.commonText,
    textAlign: 'center',
    opacity: 0.6,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: STYLES.spacing.lg,
    paddingTop: STYLES.spacing.lg,
    paddingBottom: STYLES.spacing.md,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.textfield,
    ...STYLES.shadow,
  },
  headerTitle: {
    ...FONTS.screenTitle,
    flex: 1,
  },
  sortContainer: {
    alignItems: 'flex-end',
  },
  sortDropdown: {
    width: 100,
    height: 35,
  },
  propertyList: {
    flex: 1,
    paddingHorizontal: STYLES.spacing.lg,
    paddingTop: STYLES.spacing.md,
    backgroundColor: COLORS.textfield,
  },
  propertyCard: {
    backgroundColor: COLORS.white,
    borderRadius: STYLES.borderRadius.medium,
    marginBottom: STYLES.spacing.md,
    padding: STYLES.spacing.md,
    ...STYLES.shadow,
  },
  propertyImage: {
    width: '100%',
    height: 120,
    borderRadius: STYLES.borderRadius.small,
    marginBottom: STYLES.spacing.sm,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: COLORS.textfield,
  },
  propertyInfo: {
    marginBottom: STYLES.spacing.sm,
  },
  propertyAddress: {
    ...FONTS.commonText,
    fontSize: 16,
    marginBottom: STYLES.spacing.xs,
  },
  // New style for the date text
  propertyDate: {
    ...FONTS.smallText,
    fontSize: 14,
    opacity: 0.7,
  },
  floatingAddButton: {
    position: 'absolute',
    bottom: STYLES.spacing.xl,
    right: STYLES.spacing.xl,
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  floatingAddButtonText: {
    fontSize: 24,
    lineHeight: 24,
    textAlign: 'center',
    textAlignVertical: 'center',
  },
});

export default PropertyList;