import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  LayoutAnimation,
  Platform,
  UIManager,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { ChevronDown, ChevronRight, ChevronLeft, PlusCircle, X } from 'lucide-react-native';
import { DropField } from '../../components/common';
import { supabase } from '../../api/supabaseClient';

// Enables LayoutAnimation on Android.
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const PALETTE = {
  background: '#F8F9FA',
  card: '#FFFFFF',
  textPrimary: '#111827',
  textSecondary: '#6B7280',
  primary: '#111827',
  border: '#E5E7EB',
  danger: '#DC2626',
};

// --- Reusable Modal Component ---
const FormModal = ({ visible, onClose, title, children, onSubmit, submitText = "Add" }) => (
    <Modal
        animationType="slide"
        transparent={true}
        visible={visible}
        onRequestClose={onClose}
    >
        <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
                <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>{title}</Text>
                    <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                        <X size={24} color={PALETTE.textSecondary} />
                    </TouchableOpacity>
                </View>
                <ScrollView keyboardShouldPersistTaps="handled">
                    {children}
                </ScrollView>
                <TouchableOpacity style={styles.submitButton} onPress={onSubmit}>
                    <Text style={styles.submitButtonText}>{submitText}</Text>
                </TouchableOpacity>
            </View>
        </View>
    </Modal>
);


// Renders a block of key-value pairs for asset specifications.
const SpecificationDetails = ({ specifications }) => (
  <View style={styles.specificationsBox}>
    {Object.entries(specifications).map(([key, value]) => (
      <View key={key} style={styles.specPair}>
        <Text style={styles.specKey}>{key.replace(/_/g, ' ')}</Text>
        <Text style={styles.specValue}>{String(value)}</Text>
      </View>
    ))}
  </View>
);

// An accordion component to display an asset and its change history.
const AssetAccordion = ({ asset, isExpanded, onToggle, onAddHistory }) => {
  const [expandedHistoryId, setExpandedHistoryId] = useState(null);
  
  // Filter for only accepted changelogs to display.
  const acceptedLogs = asset.ChangeLog.filter(log => log.status === 'ACCEPTED');
  const latestChange = acceptedLogs[0] || null;

  const toggleAsset = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    onToggle();
  };

  const toggleHistoryEntry = (entryId) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedHistoryId(expandedHistoryId === entryId ? null : entryId);
  };

  return (
    <View style={styles.assetContainer}>
      <TouchableOpacity style={styles.assetHeader} onPress={toggleAsset}>
        <Text style={styles.assetTitle}>{asset.name}</Text>
        {isExpanded ? <ChevronDown color={PALETTE.textPrimary} size={20} /> : <ChevronRight color={PALETTE.textPrimary} size={20} />}
      </TouchableOpacity>
      
      {isExpanded && (
        <View style={styles.assetContent}>
          <Text style={styles.contentSectionTitle}>Current Specifications</Text>
          {latestChange ? (
            <SpecificationDetails specifications={latestChange.specifications} />
          ) : (
            <Text style={styles.emptyText}>No accepted specifications for this asset yet.</Text>
          )}
          
          <View style={styles.historySectionHeader}>
            <Text style={styles.contentSectionTitle}>History</Text>
            <TouchableOpacity style={styles.addButtonSmall} onPress={() => onAddHistory(asset)}>
                <PlusCircle size={18} color={PALETTE.primary} />
                <Text style={styles.addButtonSmallText}>Add Entry</Text>
            </TouchableOpacity>
          </View>

          {acceptedLogs.length > 1 ? (
            acceptedLogs.slice(1).map((entry) => (
              <View key={entry.id} style={styles.historyItemContainer}>
                  <TouchableOpacity 
                    style={styles.historyEntry}
                    onPress={() => toggleHistoryEntry(entry.id)}
                  >
                    <View style={styles.historyHeader}>
                      <Text style={styles.historyDate}>{new Date(entry.created_at).toLocaleString()}</Text>
                      {expandedHistoryId === entry.id ? <ChevronDown color={PALETTE.textSecondary} size={16} /> : <ChevronRight color={PALETTE.textSecondary} size={16} />}
                    </View>
                    <Text style={styles.historyDescription}>“{entry.change_description}”</Text>
                    <Text style={styles.historyAuthor}>By: {entry.User ? `${entry.User.first_name} ${entry.User.last_name}` : 'System'}</Text>
                  </TouchableOpacity>
                  {expandedHistoryId === entry.id && (
                    <View style={styles.historySpecBox}>
                      <SpecificationDetails specifications={entry.specifications} />
                    </View>
                  )}
              </View>
            ))
          ) : (
             <Text style={styles.emptyText}>No other accepted history entries.</Text>
          )}
        </View>
      )}
    </View>
  );
};

// Main screen component for displaying property details.
const PropertyDetailsScreen = ({ route, navigation }) => {
  const { propertyId } = route.params || {};

  const [loading, setLoading] = useState(true);
  const [spaces, setSpaces] = useState([]);
  const [assetsBySpace, setAssetsBySpace] = useState({});
  const [selectedSpace, setSelectedSpace] = useState(null);
  const [expandedAssetId, setExpandedAssetId] = useState(null);
  
  // State for modals
  const [isAddSpaceModalVisible, setAddSpaceModalVisible] = useState(false);
  const [isAddAssetModalVisible, setAddAssetModalVisible] = useState(false);
  const [isAddHistoryModalVisible, setAddHistoryModalVisible] = useState(false);
  const [currentAsset, setCurrentAsset] = useState(null);

  // State for form inputs
  const [newSpaceName, setNewSpaceName] = useState('');
  const [newSpaceType, setNewSpaceType] = useState('');
  const [newAssetName, setNewAssetName] = useState('');
  const [newHistoryDescription, setNewHistoryDescription] = useState('');

  const fetchPropertyData = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('Property')
        .select(`
          Spaces ( 
            id, 
            name, 
            Assets ( 
              id, 
              name, 
              ChangeLog ( 
                id, 
                specifications, 
                change_description, 
                created_at,
                status,
                User ( first_name, last_name )
              )
            )
          )
        `)
        .eq('property_id', propertyId)
        .single();

      if (error) throw error;

      if (data && data.Spaces) {
        setSpaces(data.Spaces);
        const assetsMap = {};
        data.Spaces.forEach(space => {
          const sortedAssets = space.Assets.map(asset => ({
            ...asset,
            ChangeLog: [...asset.ChangeLog].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)),
          }));
          assetsMap[space.id] = sortedAssets;
        });
        setAssetsBySpace(assetsMap);
        
        if (data.Spaces.length > 0 && !selectedSpace) {
          setSelectedSpace(data.Spaces[0].id);
        }
      }
    } catch (err) {
      console.error("Error fetching property details:", err.message);
    } finally {
      setLoading(false);
    }
  }, [propertyId, selectedSpace]);

  useFocusEffect(
    useCallback(() => {
        fetchPropertyData();
    }, [fetchPropertyData])
  );

  // --- Handlers for Adding Data ---
  const handleAddSpace = async () => {
    if (!newSpaceName.trim() || !newSpaceType.trim()) {
        Alert.alert("Missing Information", "Please provide both a name and a type for the space.");
        return;
    }

    const { error } = await supabase.from('Spaces').insert({
        property_id: propertyId,
        name: newSpaceName,
        type: newSpaceType,
    });
    if (error) Alert.alert("Error adding space", error.message);
    else {
        setNewSpaceName('');
        setNewSpaceType('');
        setAddSpaceModalVisible(false);
        fetchPropertyData();
    }
  };

  const handleAddAsset = async () => {
      if (!newAssetName.trim()) {
          Alert.alert("Missing Information", "Please provide a name for the asset.");
          return;
      }
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Insert the asset
      const { data: newAsset, error: assetError } = await supabase
        .from('Assets')
        .insert({ name: newAssetName, space_id: selectedSpace, asset_type_id: 1 }) // asset_type_id is hardcoded for now
        .select()
        .single();
      
      if (assetError) {
          Alert.alert("Error adding asset", assetError.message);
          return;
      }

      // Create an initial changelog entry for the new asset
      const { error: changelogError } = await supabase.from('ChangeLog').insert({
          asset_id: newAsset.id,
          specifications: {},
          change_description: "Asset created.",
          changed_by_user_id: user.id,
          status: 'ACCEPTED' // Asset creation is auto-accepted
      });

      if (changelogError) Alert.alert("Error creating initial log", changelogError.message);
      else {
          setNewAssetName('');
          setAddAssetModalVisible(false);
          fetchPropertyData();
      }
  };

  const handleAddHistory = async () => {
      if (!newHistoryDescription.trim()) {
          Alert.alert("Missing Information", "Please provide a description for the history entry.");
          return;
      }
      if (!currentAsset) return;

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // New history inherits the specifications of the latest ACCEPTED entry
      const latestAcceptedLog = currentAsset.ChangeLog.find(log => log.status === 'ACCEPTED');
      const latestSpec = latestAcceptedLog?.specifications || {};

      const { error } = await supabase.from('ChangeLog').insert({
          asset_id: currentAsset.id,
          specifications: latestSpec,
          change_description: newHistoryDescription,
          changed_by_user_id: user.id,
          status: 'ACCEPTED' // All owner entries are auto-accepted
      });
      if (error) Alert.alert("Error adding history", error.message);
      else {
          setNewHistoryDescription('');
          setAddHistoryModalVisible(false);
          setCurrentAsset(null);
          fetchPropertyData();
      }
  };
  
  const openAddHistoryModal = (asset) => {
    setCurrentAsset(asset);
    setAddHistoryModalVisible(true);
  };

  const currentAssets = selectedSpace ? assetsBySpace[selectedSpace] || [] : [];
  const selectedSpaceName = spaces.find(s => s.id === selectedSpace)?.name || 'Select a Space';

  if (loading && !spaces.length) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <ActivityIndicator size="large" color={PALETTE.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <ChevronLeft size={24} color={PALETTE.textPrimary} />
        </TouchableOpacity>
        
        <View style={styles.dropdownContainer}>
          <DropField
            options={spaces.map(s => s.name)}
            selectedValue={selectedSpaceName}
            onSelect={(name) => {
              const space = spaces.find(s => s.name === name);
              if (space) {
                setSelectedSpace(space.id);
                setExpandedAssetId(null);
              }
            }}
            style={styles.dropdown}
            textStyle={styles.dropdownText}
          />
        </View>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <Text style={styles.pageTitle}>{selectedSpaceName}</Text>
        <View style={styles.contentContainer}>
          {currentAssets.length > 0 ? (
            currentAssets.map(asset => (
              <AssetAccordion
                key={asset.id}
                asset={asset}
                isExpanded={expandedAssetId === asset.id}
                onToggle={() => setExpandedAssetId(expandedAssetId === asset.id ? null : asset.id)}
                onAddHistory={openAddHistoryModal}
              />
            ))
          ) : (
            <View style={styles.centerContainer}>
                <Text style={styles.emptyText}>No assets found in this space.</Text>
            </View>
          )}
        </View>
      </ScrollView>

       <View style={styles.headerActions}>
          <TouchableOpacity style={styles.addButton} onPress={() => setAddSpaceModalVisible(true)}>
              <PlusCircle size={20} color={PALETTE.primary} />
              <Text style={styles.addButtonText}>Add Space</Text>
          </TouchableOpacity>
          {selectedSpace && (
              <TouchableOpacity style={styles.addButton} onPress={() => setAddAssetModalVisible(true)}>
                  <PlusCircle size={20} color={PALETTE.primary} />
                  <Text style={styles.addButtonText}>Add Asset</Text>
              </TouchableOpacity>
          )}
      </View>

      {/* --- Modals for Adding Data --- */}
      <FormModal
        visible={isAddSpaceModalVisible}
        onClose={() => setAddSpaceModalVisible(false)}
        title="Add New Space"
        onSubmit={handleAddSpace}
      >
        <TextInput
            style={styles.input}
            placeholder="Space Name (e.g., Main Bedroom)"
            value={newSpaceName}
            onChangeText={setNewSpaceName}
        />
        <TextInput
            style={styles.input}
            placeholder="Space Type (e.g., bedroom)"
            value={newSpaceType}
            onChangeText={setNewSpaceType}
        />
      </FormModal>

      <FormModal
        visible={isAddAssetModalVisible}
        onClose={() => setAddAssetModalVisible(false)}
        title={`Add Asset to ${selectedSpaceName}`}
        onSubmit={handleAddAsset}
      >
        <TextInput
            style={styles.input}
            placeholder="Asset Name (e.g., Air Conditioner)"
            value={newAssetName}
            onChangeText={setNewAssetName}
        />
      </FormModal>

      <FormModal
        visible={isAddHistoryModalVisible}
        onClose={() => setAddHistoryModalVisible(false)}
        title={`Add History to ${currentAsset?.name}`}
        onSubmit={handleAddHistory}
      >
        <TextInput
            style={[styles.input, { height: 100 }]}
            placeholder="Describe the change or update..."
            value={newHistoryDescription}
            onChangeText={setNewHistoryDescription}
            multiline
        />
      </FormModal>

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: PALETTE.card,
  },
  scrollContainer: {
    backgroundColor: PALETTE.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    minHeight: 200,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: PALETTE.border,
    backgroundColor: PALETTE.card,
  },
  backButton: {
    padding: 8,
  },
  dropdownContainer: {
    flex: 1,
    marginHorizontal: 8,
  },
  dropdown: {
    backgroundColor: PALETTE.card,
    borderColor: PALETTE.border,
    borderWidth: 1,
  },
  dropdownText: {
    color: PALETTE.textPrimary,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: PALETTE.textPrimary,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 16,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  emptyText: {
    textAlign: 'center',
    color: PALETTE.textSecondary,
    fontSize: 16,
  },
  assetContainer: {
    backgroundColor: PALETTE.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: PALETTE.border,
    marginBottom: 12,
    overflow: 'hidden',
  },
  assetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  assetTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: PALETTE.textPrimary,
    flex: 1,
  },
  assetContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  contentSectionTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: PALETTE.textSecondary,
    marginTop: 16,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  specificationsBox: {
    backgroundColor: PALETTE.background,
    borderRadius: 6,
    padding: 12,
    borderWidth: 1,
    borderColor: PALETTE.border,
  },
  specPair: {
    flexDirection: 'row',
    paddingVertical: 4,
  },
  specKey: {
    fontWeight: '500',
    textTransform: 'capitalize',
    width: '40%',
    color: PALETTE.textSecondary,
  },
  specValue: {
    flex: 1,
    color: PALETTE.textPrimary,
  },
  historyItemContainer: {
    marginTop: 8,
  },
  historyEntry: {
    padding: 12,
    backgroundColor: PALETTE.card,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: PALETTE.border,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  historyDate: {
    fontSize: 12,
    color: PALETTE.textSecondary,
  },
  historyDescription: {
    fontStyle: 'italic',
    color: PALETTE.textPrimary,
    marginTop: 8,
  },
  historyAuthor: {
    fontSize: 12,
    color: PALETTE.textSecondary,
    marginTop: 8,
    textAlign: 'right',
  },
  historySpecBox: {
    paddingTop: 12,
    paddingLeft: 12,
    borderLeftWidth: 2,
    borderLeftColor: PALETTE.border,
    marginTop: 12, 
    marginLeft: 16, 
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: PALETTE.card,
    borderRadius: 12,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: PALETTE.textPrimary,
  },
  closeButton: {
    padding: 8,
  },
  input: {
    backgroundColor: PALETTE.background,
    borderWidth: 1,
    borderColor: PALETTE.border,
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    marginBottom: 12,
  },
  submitButton: {
    backgroundColor: PALETTE.primary,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  submitButtonText: {
    color: PALETTE.card,
    fontSize: 16,
    fontWeight: '600',
  },
  headerActions: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      padding: 16,
      borderTopWidth: 1,
      borderColor: PALETTE.border,
      backgroundColor: PALETTE.card,
  },
  addButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 8,
      paddingHorizontal: 12,
  },
  addButtonText: {
      marginLeft: 8,
      fontSize: 16,
      fontWeight: '500',
      color: PALETTE.primary,
  },
  historySectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
  },
  addButtonSmall: {
      flexDirection: 'row',
      alignItems: 'center',
  },
  addButtonSmallText: {
      marginLeft: 4,
      fontSize: 14,
      fontWeight: '500',
      color: PALETTE.primary,
  },
});

export default PropertyDetailsScreen;