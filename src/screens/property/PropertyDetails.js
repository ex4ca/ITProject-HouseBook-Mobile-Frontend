import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { Button, DropField } from '../../components/common';
import { COLORS, FONTS, STYLES } from '../../components/styles/constants';
import { mockProperties, interiorSections, exteriorSections } from '../../constants/mockData';

const PropertyDetails = ({ route, navigation }) => {
  const { property } = route?.params || { property: mockProperties[0] };
  const [isExterior, setIsExterior] = useState(true);
  const [selectedSection, setSelectedSection] = useState(exteriorSections[0]);

  // Get current sections based on interior/exterior
  const currentSections = isExterior ? exteriorSections : interiorSections;

  // Update selected section when switching between exterior/interior
  React.useEffect(() => {
    setSelectedSection(currentSections[0]);
  }, [isExterior]);

  const handleSectionChange = (section) => {
    setSelectedSection(section);
  };

  const toggleExteriorInterior = () => {
    setIsExterior(!isExterior);
  };

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
        
        {/* Section Dropdown Container */}
        <View style={styles.dropdownContainer}>
          <DropField
            options={currentSections}
            selectedValue={selectedSection}
            onSelect={handleSectionChange}
            placeholder="Select Section"
            style={styles.dropdown}
            textStyle={styles.dropdownText}
          />
        </View>

        {/* Exterior/Interior Toggle Button */}
        <TouchableOpacity
          style={styles.toggleButton}
          onPress={toggleExteriorInterior}
        >
          <Text style={styles.toggleButtonText}>
            {isExterior ? 'E' : 'I'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content Area */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.sectionContent}>
          <Text style={styles.sectionTitle}>
            {isExterior ? 'Exterior' : 'Interior'} - {selectedSection}
          </Text>
          
          <View style={styles.placeholderContent}>
            <Text style={styles.placeholderText}>
              Content for {selectedSection} will be displayed here.
            </Text>
            <Text style={styles.placeholderSubtext}>
              This section will contain detailed information about the selected {isExterior ? 'exterior' : 'interior'} component.
            </Text>
          </View>
        </View>
      </ScrollView>
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
    alignItems: 'center',
    paddingHorizontal: STYLES.spacing.lg,
    paddingTop: STYLES.spacing.sm,
    paddingBottom: STYLES.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.textfield,
    backgroundColor: COLORS.white,
    ...STYLES.shadow,
  },
  backButton: {
    width: 50,
    height: 45,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    ...FONTS.commonText,
    fontSize: 24,
  },
  dropdownContainer: {
    flex: 1,
    marginHorizontal: STYLES.spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropdown: {
    width: '100%',
    maxWidth: 280,
    height: 45,
  },
  dropdownText: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '500',
  },
  toggleButton: {
    width: 50,
    height: 45,
    backgroundColor: COLORS.primary,
    borderRadius: STYLES.borderRadius.medium,
    justifyContent: 'center',
    alignItems: 'center',
  },
  toggleButtonText: {
    ...FONTS.highlightText,
    fontSize: 16,
    fontWeight: 'bold',
  },
  
  // Top Controls Section
  controlsSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: STYLES.spacing.lg,
    paddingVertical: STYLES.spacing.lg,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.textfield,
  },
  dropdownContainer: {
    flex: 1,
    marginRight: STYLES.spacing.lg,
  },
  sectionDropdown: {
    width: '100%',
    height: 40,
  },
  toggleContainer: {
    flexDirection: 'row',
    borderRadius: STYLES.borderRadius.medium,
    overflow: 'hidden',
  },
  toggleButton: {
    paddingVertical: STYLES.spacing.sm,
    paddingHorizontal: STYLES.spacing.lg,
    backgroundColor: COLORS.secondary,
    borderWidth: 1,
    borderColor: COLORS.secondary,
  },
  leftToggle: {
    borderTopLeftRadius: STYLES.borderRadius.medium,
    borderBottomLeftRadius: STYLES.borderRadius.medium,
    borderRightWidth: 0,
  },
  rightToggle: {
    borderTopRightRadius: STYLES.borderRadius.medium,
    borderBottomRightRadius: STYLES.borderRadius.medium,
    borderLeftWidth: 0,
  },
  activeToggle: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  toggleText: {
    ...FONTS.hintText,
    fontSize: 14,
    textAlign: 'center',
  },
  activeToggleText: {
    ...FONTS.highlightText,
    fontSize: 14,
  },
  
  // Content Area
  content: {
    flex: 1,
    backgroundColor: COLORS.textfield,
  },
  sectionContent: {
    padding: STYLES.spacing.lg,
  },
  sectionTitle: {
    ...FONTS.screenTitle,
    fontSize: 24,
    marginBottom: STYLES.spacing.xl,
    textAlign: 'center',
  },
  placeholderContent: {
    backgroundColor: COLORS.white,
    borderRadius: STYLES.borderRadius.medium,
    padding: STYLES.spacing.xl,
    alignItems: 'center',
    ...STYLES.shadow,
  },
  placeholderText: {
    ...FONTS.commonText,
    fontSize: 16,
    textAlign: 'center',
    marginBottom: STYLES.spacing.md,
  },
  placeholderSubtext: {
    ...FONTS.hintText,
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.7,
  },
});

export default PropertyDetails;
