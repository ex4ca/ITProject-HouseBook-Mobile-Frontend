import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Modal,
  TextInput,
} from 'react-native';
import { interiorSections, exteriorSections, kitchenComponents } from '../../constants/mockData';

const PropertyEditScreen = ({ route, navigation }) => {
  const { property, section = 'Interior' } = route?.params || {};
  const [selectedSection, setSelectedSection] = useState(section);
  const [isAddingSectionModal, setIsAddingSectionModal] = useState(false);
  const [newSectionName, setNewSectionName] = useState('');
  const [expandedComponent, setExpandedComponent] = useState(null);

  const sections = selectedSection === 'Interior' ? interiorSections : exteriorSections;

  const ComponentSection = ({ sectionName, isExpanded, onToggle }) => {
    // Get components for this section (mock data)
    const getComponentsForSection = (section) => {
      if (section === 'Kitchen') {
        return kitchenComponents;
      }
      return []; // Other sections would have their own components
    };

    const components = getComponentsForSection(sectionName);

    return (
      <View style={styles.componentSection}>
        <TouchableOpacity
          style={styles.componentHeader}
          onPress={() => onToggle(sectionName)}
        >
          <Text style={styles.componentTitle}>{sectionName}</Text>
          {components.length > 0 && (
            <Text style={styles.expandIcon}>
              {isExpanded ? '▼' : '▶'}
            </Text>
          )}
        </TouchableOpacity>

        {/* Show component tags if Kitchen and expanded */}
        {sectionName === 'Kitchen' && isExpanded && (
          <View style={styles.kitchenComponents}>
            {kitchenComponents.map((component, index) => (
              <TouchableOpacity
                key={index}
                style={styles.componentTag}
                onPress={() =>
                  navigation.navigate('ComponentDetails', {
                    property,
                    section: sectionName,
                    component,
                  })
                }
              >
                <Text style={styles.componentText}>{component}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={styles.addComponentButton}>
              <Text style={styles.addComponentText}>+</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Divider */}
        <View style={styles.sectionDivider} />
      </View>
    );
  };

  const SectionSelector = () => (
    <View style={styles.sectionSelector}>
      <TouchableOpacity
        style={[
          styles.sectionButton,
          selectedSection === 'Exterior' && styles.activeSectionButton,
        ]}
        onPress={() => setSelectedSection('Exterior')}
      >
        <Text
          style={[
            styles.sectionButtonText,
            selectedSection === 'Exterior' && styles.activeSectionText,
          ]}
        >
          Exterior
        </Text>
        <Text style={styles.sectionDropdown}>▼</Text>
      </TouchableOpacity>
    </View>
  );

  const handleAddSection = () => {
    if (newSectionName.trim()) {
      // TODO: Add new section to data
      console.log('Adding section:', newSectionName);
      setNewSectionName('');
      setIsAddingSectionModal(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>← Edit- {selectedSection}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Section Title */}
        <Text style={styles.pageTitle}>{selectedSection}</Text>

        {/* Section Selector (only show for Exterior) */}
        {selectedSection === 'Exterior' && <SectionSelector />}

        {/* Sections List */}
        <View style={styles.sectionsContainer}>
          {sections.map((sectionName, index) => (
            <ComponentSection
              key={index}
              sectionName={sectionName}
              isExpanded={expandedComponent === sectionName}
              onToggle={(name) =>
                setExpandedComponent(expandedComponent === name ? null : name)
              }
            />
          ))}

          {/* Add New Section */}
          <TouchableOpacity
            style={styles.addSectionButton}
            onPress={() => setIsAddingSectionModal(true)}
          >
            <Text style={styles.addSectionText}>+</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Add Section Modal */}
      <Modal
        visible={isAddingSectionModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsAddingSectionModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add New Section</Text>
            
            <TextInput
              style={styles.modalInput}
              placeholder="Enter the Name"
              value={newSectionName}
              onChangeText={setNewSectionName}
              autoFocus
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setIsAddingSectionModal(false)}
              >
                <Text style={styles.modalCancelText}>✕</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.modalConfirmButton}
                onPress={handleAddSection}
              >
                <Text style={styles.modalConfirmText}>✓</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    alignSelf: 'flex-start',
  },
  backButtonText: {
    fontSize: 18,
    color: '#333',
    fontWeight: '500',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    paddingVertical: 20,
  },
  sectionSelector: {
    marginBottom: 20,
  },
  sectionButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#e0e0e0',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 25,
  },
  activeSectionButton: {
    backgroundColor: '#333',
  },
  sectionButtonText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  activeSectionText: {
    color: '#fff',
  },
  sectionDropdown: {
    fontSize: 12,
    color: '#666',
  },
  sectionsContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 20,
  },
  componentSection: {
    paddingHorizontal: 20,
  },
  componentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
  },
  componentTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  expandIcon: {
    fontSize: 12,
    color: '#666',
  },
  kitchenComponents: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingBottom: 15,
  },
  componentTag: {
    backgroundColor: '#e0e0e0',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginRight: 10,
    marginBottom: 8,
  },
  componentText: {
    fontSize: 14,
    color: '#333',
  },
  addComponentButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#e0e0e0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    marginBottom: 8,
  },
  addComponentText: {
    fontSize: 16,
    color: '#333',
    fontWeight: 'bold',
  },
  sectionDivider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 5,
  },
  addSectionButton: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  addSectionText: {
    fontSize: 24,
    color: '#333',
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '80%',
    maxWidth: 300,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  modalCancelButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#333',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCancelText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalConfirmButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#333',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalConfirmText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default PropertyEditScreen;
