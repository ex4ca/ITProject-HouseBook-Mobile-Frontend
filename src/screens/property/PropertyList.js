import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Image,
} from 'react-native';
import { Button, DropField } from '../../components/common';
import { COLORS, FONTS, STYLES } from '../../components/styles/constants';
import { mockProperties, sortOptions } from '../../constants/mockData';

const PropertyList = ({ navigation, isOwner = true }) => {
  const [selectedSort, setSelectedSort] = useState('newest');
  const [properties] = useState(mockProperties);

  const getSortedProperties = () => {
    switch (selectedSort) {
      case 'oldest':
        return [...properties].reverse();
      case 'a-z':
        return [...properties].sort((a, b) => a.address.localeCompare(b.address));
      case 'z-a':
        return [...properties].sort((a, b) => b.address.localeCompare(a.address));
      default:
        return properties;
    }
  };

  const PropertyCard = ({ property }) => (
    <TouchableOpacity
      style={styles.propertyCard}
      onPress={() => navigation.navigate('PropertyDetails', { property, isOwner })}
    >
      {/* Property Image Placeholder */}
      <View style={styles.propertyImage}>
        {property.image ? (
          <Image source={{ uri: property.image }} style={styles.image} />
        ) : (
          <View style={styles.imagePlaceholder} />
        )}
      </View>

      {/* Property Info */}
      <View style={styles.propertyInfo}>
        <Text style={styles.propertyAddress}>{property.address}</Text>
        <View style={styles.statusContainer}>
          <Text style={[styles.statusText, { color: property.statusColor }]}>
            {property.status}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );



  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Property</Text>
        
        {/* Sort Options */}
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

      {/* Property List */}
      <ScrollView style={styles.propertyList} showsVerticalScrollIndicator={false}>
        {getSortedProperties().map((property) => (
          <PropertyCard key={property.id} property={property} />
        ))}
      </ScrollView>

      {/* Floating Add Button - Only show for tradie users */}
      {!isOwner && (
        <Button
          text="+"
          onPress={() => navigation.navigate('Scanner')}
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
  statusContainer: {
    alignSelf: 'flex-start',
  },
  statusText: {
    ...FONTS.smallText,
    fontSize: 14,
    paddingHorizontal: STYLES.spacing.sm,
    paddingVertical: STYLES.spacing.xs,
    backgroundColor: COLORS.secondary,
    borderRadius: STYLES.borderRadius.small,
    overflow: 'hidden',
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
