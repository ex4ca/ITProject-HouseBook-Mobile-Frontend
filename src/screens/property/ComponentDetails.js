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
import { mockProperties } from '../../constants/mockData';

const ComponentDetailsScreen = ({ route, navigation }) => {
  const { property, section, component } = route?.params || {
    property: mockProperties[0],
    section: 'Kitchen',
    component: 'sink',
  };

  const [selectedComponent, setSelectedComponent] = useState(component);
  const [isEditingComponent, setIsEditingComponent] = useState(false);
  const [isAddingEntry, setIsAddingEntry] = useState(false);
  const [newEntry, setNewEntry] = useState({
    date: '',
    title: '',
    description: '',
  });

  // Get component data from mock property
  const getComponentData = () => {
    if (section === 'Kitchen' && property.sections?.interior?.kitchen?.[component]) {
      return property.sections.interior.kitchen[component];
    }
    return [];
  };

  const componentData = getComponentData();
  const kitchenComponents = ['sink', 'oven', 'cabinet', 'kitchen island', 'fridge'];

  const ComponentSelector = ({ components, selected, onSelect }) => (
    <View style={styles.componentSelector}>
      {components.map((comp, index) => (
        <TouchableOpacity
          key={index}
          style={[
            styles.componentButton,
            comp === selected && styles.activeComponentButton,
          ]}
          onPress={() => onSelect(comp)}
        >
          <Text
            style={[
              styles.componentButtonText,
              comp === selected && styles.activeComponentText,
            ]}
          >
            {comp}
          </Text>
        </TouchableOpacity>
      ))}
      <TouchableOpacity style={styles.addComponentButton}>
        <Text style={styles.addComponentText}>+</Text>
      </TouchableOpacity>
    </View>
  );

  const HistoryEntry = ({ entry, onEdit, onDelete }) => (
    <View style={styles.historyEntry}>
      <View style={styles.entryHeader}>
        <View style={styles.entryDate}>
          <Text style={styles.entryDateText}>{entry.date}</Text>
        </View>
        <View style={styles.entryActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => onEdit(entry)}
          >
            <Text style={styles.actionText}>+</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => onDelete(entry.id)}
          >
            <Text style={styles.actionText}>✕</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.entryContent}>
        <Text style={styles.entryTitle}>{entry.title}</Text>
        <Text style={styles.entryDescription}>{entry.description}</Text>
        <View style={[styles.statusIndicator, { backgroundColor: '#4CAF50' }]} />
      </View>
    </View>
  );

  const AddEntryModal = () => (
    <Modal
      visible={isAddingEntry}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setIsAddingEntry(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Add Entry</Text>
          
          <TextInput
            style={styles.modalInput}
            placeholder="Date"
            value={newEntry.date}
            onChangeText={(text) => setNewEntry({ ...newEntry, date: text })}
          />
          
          <TextInput
            style={styles.modalInput}
            placeholder="Title"
            value={newEntry.title}
            onChangeText={(text) => setNewEntry({ ...newEntry, title: text })}
          />
          
          <TextInput
            style={[styles.modalInput, styles.modalTextArea]}
            placeholder="Description"
            value={newEntry.description}
            onChangeText={(text) => setNewEntry({ ...newEntry, description: text })}
            multiline
            numberOfLines={3}
          />

          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={styles.modalCancelButton}
              onPress={() => setIsAddingEntry(false)}
            >
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.modalConfirmButton}
              onPress={() => {
                // TODO: Add entry to component data
                console.log('Adding entry:', newEntry);
                setNewEntry({ date: '', title: '', description: '' });
                setIsAddingEntry(false);
              }}
            >
              <Text style={styles.modalConfirmText}>Add</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>← {section} - {selectedComponent}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Component Title */}
        <View style={styles.titleSection}>
          <Text style={styles.pageTitle}>{section} - {selectedComponent}</Text>
          <Text style={styles.expandIcon}>▲</Text>
        </View>

        {/* Current Component Highlight */}
        <View style={styles.currentComponent}>
          <Text style={[styles.componentButtonText, styles.activeComponentText]}>
            {selectedComponent}
          </Text>
        </View>

        {/* Component History */}
        <View style={styles.historySection}>
          {componentData.length > 0 ? (
            componentData.map((entry, index) => (
              <HistoryEntry
                key={index}
                entry={entry}
                onEdit={(entry) => {
                  // TODO: Implement edit functionality
                  console.log('Edit entry:', entry);
                }}
                onDelete={(id) => {
                  // TODO: Implement delete functionality
                  console.log('Delete entry:', id);
                }}
              />
            ))
          ) : (
            <View style={styles.noHistoryContainer}>
              <Text style={styles.noHistoryTitle}>No History for</Text>
              <Text style={styles.noHistoryComponent}>{selectedComponent}</Text>
            </View>
          )}
        </View>

        {/* Other Components */}
        <ComponentSelector
          components={kitchenComponents.filter(comp => comp !== selectedComponent)}
          selected={null}
          onSelect={(comp) => {
            setSelectedComponent(comp);
            // Navigate to the same screen with different component
            navigation.setParams({ component: comp });
          }}
        />
      </ScrollView>

      {/* Floating Edit Button */}
      <TouchableOpacity
        style={styles.floatingEditButton}
        onPress={() => setIsAddingEntry(true)}
      >
        <Text style={styles.floatingEditText}>✏️</Text>
      </TouchableOpacity>

      {/* Add Entry Modal */}
      <AddEntryModal />
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
  titleSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 20,
  },
  pageTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  expandIcon: {
    fontSize: 12,
    color: '#666',
  },
  currentComponent: {
    backgroundColor: '#333',
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 12,
    alignSelf: 'flex-start',
    marginBottom: 20,
  },
  componentSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingVertical: 20,
  },
  componentButton: {
    backgroundColor: '#e0e0e0',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginRight: 10,
    marginBottom: 8,
  },
  activeComponentButton: {
    backgroundColor: '#333',
  },
  componentButtonText: {
    fontSize: 14,
    color: '#333',
  },
  activeComponentText: {
    color: '#fff',
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
  historySection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 15,
    marginBottom: 20,
  },
  historyEntry: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  entryDate: {
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  entryDateText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  entryActions: {
    flexDirection: 'row',
  },
  actionButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#e0e0e0',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  actionText: {
    fontSize: 14,
    color: '#333',
    fontWeight: 'bold',
  },
  entryContent: {
    position: 'relative',
  },
  entryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  entryDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  statusIndicator: {
    position: 'absolute',
    right: 0,
    top: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  noHistoryContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  noHistoryTitle: {
    fontSize: 18,
    color: '#999',
    marginBottom: 5,
  },
  noHistoryComponent: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  floatingEditButton: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#333',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  floatingEditText: {
    fontSize: 24,
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
    width: '90%',
    maxWidth: 400,
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
    marginBottom: 15,
  },
  modalTextArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
  },
  modalCancelButton: {
    backgroundColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 30,
    paddingVertical: 12,
  },
  modalCancelText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '500',
  },
  modalConfirmButton: {
    backgroundColor: '#333',
    borderRadius: 8,
    paddingHorizontal: 30,
    paddingVertical: 12,
  },
  modalConfirmText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default ComponentDetailsScreen;
