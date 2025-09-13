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
import { ChevronDown, ChevronRight, ChevronLeft, PlusCircle, X, Trash2 } from 'lucide-react-native';
import { DropField } from '../../components';
import { supabase } from '../../config/supabaseClient';

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

const FormModal = ({ visible, onClose, title, children, onSubmit, submitText = "Add" }) => (
    <Modal animationType="slide" transparent={true} visible={visible} onRequestClose={onClose}>
        <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
                <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>{title}</Text>
                    <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                        <X size={24} color={PALETTE.textSecondary} />
                    </TouchableOpacity>
                </View>
                <ScrollView keyboardShouldPersistTaps="handled">{children}</ScrollView>
                <TouchableOpacity style={styles.submitButton} onPress={onSubmit}>
                    <Text style={styles.submitButtonText}>{submitText}</Text>
                </TouchableOpacity>
            </View>
        </View>
    </Modal>
);

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

const AssetAccordion = ({ asset, isExpanded, onToggle, onAddHistory }) => {
  const [expandedHistoryId, setExpandedHistoryId] = useState(null);
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
        <Text style={styles.assetTitle}>{asset.description}</Text>
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

const PropertyDetails = ({ route, navigation }) => {
  const { propertyId } = route.params || {};

  const [loading, setLoading] = useState(true);
  const [spaces, setSpaces] = useState([]);
  const [assetTypes, setAssetTypes] = useState([]);
  const [assetsBySpace, setAssetsBySpace] = useState({});
  const [selectedSpace, setSelectedSpace] = useState(null);
  const [expandedAssetId, setExpandedAssetId] = useState(null);
  
  const [isAddSpaceModalVisible, setAddSpaceModalVisible] = useState(false);
  const [isAddAssetModalVisible, setAddAssetModalVisible] = useState(false);
  const [isAddHistoryModalVisible, setAddHistoryModalVisible] = useState(false);
  const [currentAsset, setCurrentAsset] = useState(null);

  const [newSpaceName, setNewSpaceName] = useState('');
  const [newSpaceType, setNewSpaceType] = useState(null);
  const [newAssetDescription, setNewAssetDescription] = useState('');
  const [selectedAssetType, setSelectedAssetType] = useState(null);
  const [newHistoryDescription, setNewHistoryDescription] = useState('');
  const [editableSpecs, setEditableSpecs] = useState([]);

  const spaceTypeOptions = ['Bedroom', 'Bathroom', 'Kitchen', 'Living Area', 'Hallway', 'Laundry', 'Garage', 'Exterior', 'Garden', 'Other'];

  useFocusEffect(
    useCallback(() => {
      const fetchPropertyData = async () => {
        setLoading(true);
        try {
          const [propertyResponse, assetTypesResponse] = await Promise.all([
              supabase.from('Property').select(`Spaces (id, name, Assets (id, description, ChangeLog (id, specifications, change_description, created_at, status, User (first_name, last_name))))`).eq('property_id', propertyId).single(),
              supabase.from('AssetTypes').select('id, name')
          ]);
    
          const { data, error } = propertyResponse;
          if (error && error.code !== 'PGRST116') throw error;
          if (data && data.Spaces) {
            setSpaces(data.Spaces);
            const assetsMap = {};
            data.Spaces.forEach(space => {
              assetsMap[space.id] = space.Assets.map(asset => ({...asset, ChangeLog: [...asset.ChangeLog].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))}));
            });
            setAssetsBySpace(assetsMap);
            if (data.Spaces.length > 0 && !selectedSpace) {
              setSelectedSpace(data.Spaces[0].id);
            }
          }
    
          const { data: assetTypesData, error: assetTypesError } = assetTypesResponse;
          if (assetTypesError) throw assetTypesError;
          setAssetTypes(assetTypesData || []);
    
        } catch (err) {
          console.error("Error fetching property details:", err.message);
        } finally {
          setLoading(false);
        }
      };

      fetchPropertyData();
    }, [propertyId, selectedSpace])
  );

  const handleAddSpace = async () => {
    if (!newSpaceName.trim() || !newSpaceType) {
      Alert.alert("Missing Information", "Please provide a name and select a type.");
      return;
    }
    const { error } = await supabase.from('Spaces').insert({ property_id: propertyId, name: newSpaceName, type: newSpaceType });
    if (error) Alert.alert("Error", error.message);
    else {
      setNewSpaceName(''); setNewSpaceType(null); setAddSpaceModalVisible(false); // Refetch is triggered by useFocusEffect
    }
  };

  const handleAddAsset = async () => {
    if (!newAssetDescription.trim() || !selectedAssetType) {
      Alert.alert("Missing Information", "Please select an asset type and provide a description.");
      return;
    }
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data: newAsset, error: assetError } = await supabase.from('Assets').insert({ description: newAssetDescription, space_id: selectedSpace, asset_type_id: selectedAssetType }).select().single();
    if (assetError) { Alert.alert("Error", assetError.message); return; }
    const { error: changelogError } = await supabase.from('ChangeLog').insert({ asset_id: newAsset.id, specifications: {}, change_description: "Asset created.", changed_by_user_id: user.id, status: 'ACCEPTED' });
    if (changelogError) Alert.alert("Error", changelogError.message);
    else {
      setNewAssetDescription(''); setSelectedAssetType(null); setAddAssetModalVisible(false); // Refetch is triggered by useFocusEffect
    }
  };

  const handleAddHistory = async () => {
    if (!newHistoryDescription.trim()) {
      Alert.alert("Missing Information", "Please provide a description.");
      return;
    }
    if (!currentAsset) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const newSpecifications = editableSpecs.reduce((acc, spec) => {
        if (spec.key.trim()) { acc[spec.key.trim()] = spec.value.trim(); }
        return acc;
    }, {});

    const { error } = await supabase.from('ChangeLog').insert({ asset_id: currentAsset.id, specifications: newSpecifications, change_description: newHistoryDescription, changed_by_user_id: user.id, status: 'ACCEPTED' });
    if (error) Alert.alert("Error", error.message);
    else {
      setNewHistoryDescription(''); setAddHistoryModalVisible(false); setCurrentAsset(null); // Refetch is triggered by useFocusEffect
    }
  };

  const openAddHistoryModal = (asset) => {
    setCurrentAsset(asset);
    const latestAcceptedLog = asset.ChangeLog.find(log => log.status === 'ACCEPTED');
    const latestSpecs = latestAcceptedLog?.specifications || {};
    const specsArray = Object.entries(latestSpecs).map(([key, value], index) => ({ id: index, key, value }));
    setEditableSpecs(specsArray);
    setAddHistoryModalVisible(true);
  };

  const handleSpecChange = (id, field, value) => {
    setEditableSpecs(prevSpecs => prevSpecs.map(spec => spec.id === id ? { ...spec, [field]: value } : spec));
  };

  const addNewSpecRow = () => {
      setEditableSpecs(prevSpecs => [...prevSpecs, { id: Date.now(), key: '', value: '' }]);
  };

  const removeSpecRow = (id) => {
      setEditableSpecs(prevSpecs => prevSpecs.filter(spec => spec.id !== id));
  };

  const currentAssets = selectedSpace ? assetsBySpace[selectedSpace] || [] : [];
  const selectedSpaceName = spaces.find(s => s.id === selectedSpace)?.name || 'Select a Space';

  if (loading && !spaces.length) {
    return (<SafeAreaView style={styles.centerContainer}><ActivityIndicator size="large" color={PALETTE.primary} /></SafeAreaView>);
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}><ChevronLeft size={24} color={PALETTE.textPrimary} /></TouchableOpacity>
        <View style={styles.dropdownContainer}>
          <DropField
            options={spaces.map(s => s.name)}
            selectedValue={selectedSpaceName}
            onSelect={(name) => {
              const space = spaces.find(s => s.name === name);
              if (space) { setSelectedSpace(space.id); setExpandedAssetId(null); }
            }}
            style={styles.dropdown} textStyle={styles.dropdownText}
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
                key={asset.id} asset={asset} isExpanded={expandedAssetId === asset.id}
                onToggle={() => setExpandedAssetId(expandedAssetId === asset.id ? null : asset.id)}
                onAddHistory={openAddHistoryModal}
              />
            ))
          ) : (<View style={styles.centerContainer}><Text style={styles.emptyText}>No assets found in this space.</Text></View>)}
        </View>
      </ScrollView>
      <View style={styles.headerActions}>
        <TouchableOpacity style={styles.addButton} onPress={() => setAddSpaceModalVisible(true)}><PlusCircle size={20} color={PALETTE.primary} /><Text style={styles.addButtonText}>Add Space</Text></TouchableOpacity>
        {selectedSpace && (<TouchableOpacity style={styles.addButton} onPress={() => setAddAssetModalVisible(true)}><PlusCircle size={20} color={PALETTE.primary} /><Text style={styles.addButtonText}>Add Asset</Text></TouchableOpacity>)}
      </View>

      <FormModal visible={isAddSpaceModalVisible} onClose={() => setAddSpaceModalVisible(false)} title="Add New Space" onSubmit={handleAddSpace}>
        <TextInput style={styles.input} placeholder="Space Name (e.g., Main Bedroom)" value={newSpaceName} onChangeText={setNewSpaceName} />
        <DropField options={spaceTypeOptions} selectedValue={newSpaceType} onSelect={setNewSpaceType} placeholder="Select a space type..." />
      </FormModal>

      <FormModal visible={isAddAssetModalVisible} onClose={() => setAddAssetModalVisible(false)} title={`Add Asset to ${selectedSpaceName}`} onSubmit={handleAddAsset}>
        <DropField
            options={assetTypes.map(t => t.name)}
            selectedValue={assetTypes.find(t => t.id === selectedAssetType)?.name}
            onSelect={name => {
                const type = assetTypes.find(t => t.name === name);
                setSelectedAssetType(type ? type.id : null);
            }}
            placeholder="Select an asset type..." style={{ marginBottom: 12 }}
        />
        <TextInput style={styles.input} placeholder="Asset Description (e.g., Air Conditioner)" value={newAssetDescription} onChangeText={setNewAssetDescription} />
      </FormModal>

      <FormModal visible={isAddHistoryModalVisible} onClose={() => setAddHistoryModalVisible(false)} title={`Update ${currentAsset?.description}`} onSubmit={handleAddHistory} submitText="Submit Update">
        <Text style={styles.label}>Update Description</Text>
        <TextInput style={[styles.input, { height: 80 }]} placeholder="Describe the change or update..." value={newHistoryDescription} onChangeText={setNewHistoryDescription} multiline />
        <Text style={styles.label}>Specifications</Text>
        {editableSpecs.map((spec) => (
            <View key={spec.id} style={styles.specRow}>
                <TextInput style={[styles.input, styles.specInputKey]} placeholder="Attribute" value={spec.key} onChangeText={(text) => handleSpecChange(spec.id, 'key', text)} />
                <TextInput style={[styles.input, styles.specInputValue]} placeholder="Value" value={spec.value} onChangeText={(text) => handleSpecChange(spec.id, 'value', text)} />
                <TouchableOpacity onPress={() => removeSpecRow(spec.id)} style={styles.removeRowButton}><Trash2 size={20} color={PALETTE.danger} /></TouchableOpacity>
            </View>
        ))}
        <TouchableOpacity style={styles.addRowButton} onPress={addNewSpecRow}><PlusCircle size={20} color={PALETTE.primary} /><Text style={styles.addRowButtonText}>Add Attribute</Text></TouchableOpacity>
      </FormModal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: PALETTE.card },
  scrollContainer: { backgroundColor: PALETTE.background },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, minHeight: 200 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: PALETTE.border, backgroundColor: PALETTE.card },
  backButton: { padding: 8 },
  dropdownContainer: { flex: 1, marginHorizontal: 8 },
  dropdown: { backgroundColor: PALETTE.card, borderColor: PALETTE.border, borderWidth: 1 },
  dropdownText: { color: PALETTE.textPrimary },
  pageTitle: { fontSize: 28, fontWeight: 'bold', color: PALETTE.textPrimary, paddingHorizontal: 20, paddingTop: 24, paddingBottom: 16 },
  contentContainer: { paddingHorizontal: 20, paddingBottom: 20 },
  emptyText: { textAlign: 'center', color: PALETTE.textSecondary, fontSize: 16 },
  assetContainer: { backgroundColor: PALETTE.card, borderRadius: 8, borderWidth: 1, borderColor: PALETTE.border, marginBottom: 12, overflow: 'hidden' },
  assetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 },
  assetTitle: { fontSize: 18, fontWeight: '600', color: PALETTE.textPrimary, flex: 1 },
  assetContent: { paddingHorizontal: 16, paddingBottom: 16 },
  contentSectionTitle: { fontSize: 14, fontWeight: '500', color: PALETTE.textSecondary, marginTop: 16, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  specificationsBox: { backgroundColor: PALETTE.background, borderRadius: 6, padding: 12, borderWidth: 1, borderColor: PALETTE.border },
  specPair: { flexDirection: 'row', paddingVertical: 4 },
  specKey: { fontWeight: '500', textTransform: 'capitalize', width: '40%', color: PALETTE.textSecondary },
  specValue: { flex: 1, color: PALETTE.textPrimary },
  historyItemContainer: { marginTop: 8 },
  historyEntry: { padding: 12, backgroundColor: PALETTE.card, borderRadius: 6, borderWidth: 1, borderColor: PALETTE.border },
  historyHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  historyDate: { fontSize: 12, color: PALETTE.textSecondary },
  historyDescription: { fontStyle: 'italic', color: PALETTE.textPrimary, marginTop: 8 },
  historyAuthor: { fontSize: 12, color: PALETTE.textSecondary, marginTop: 8, textAlign: 'right' },
  historySpecBox: { paddingTop: 12, paddingLeft: 12, borderLeftWidth: 2, borderLeftColor: PALETTE.border, marginTop: 12, marginLeft: 16 },
  modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)' },
  modalContainer: { width: '90%', maxHeight: '80%', backgroundColor: PALETTE.card, borderRadius: 12, padding: 20 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: '600', color: PALETTE.textPrimary },
  closeButton: { padding: 8 },
  input: { backgroundColor: PALETTE.background, borderWidth: 1, borderColor: PALETTE.border, borderRadius: 8, padding: 16, fontSize: 16, marginBottom: 12 },
  submitButton: { backgroundColor: PALETTE.primary, borderRadius: 8, padding: 16, alignItems: 'center', marginTop: 16 },
  submitButtonText: { color: PALETTE.card, fontSize: 16, fontWeight: '600' },
  headerActions: { flexDirection: 'row', justifyContent: 'space-around', padding: 16, borderTopWidth: 1, borderColor: PALETTE.border, backgroundColor: PALETTE.card },
  addButton: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, paddingHorizontal: 12 },
  addButtonText: { marginLeft: 8, fontSize: 16, fontWeight: '500', color: PALETTE.primary },
  historySectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  addButtonSmall: { flexDirection: 'row', alignItems: 'center' },
  addButtonSmallText: { marginLeft: 4, fontSize: 14, fontWeight: '500', color: PALETTE.primary },
  label: { fontSize: 14, fontWeight: '500', color: PALETTE.textSecondary, marginBottom: 8 },
  specRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  specInputKey: { flex: 2, marginRight: 8, marginBottom: 0, padding: 12 },
  specInputValue: { flex: 3, marginBottom: 0, padding: 12 },
  removeRowButton: { padding: 8, marginLeft: 4 },
  addRowButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 12, marginTop: 8 },
  addRowButtonText: { marginLeft: 8, color: PALETTE.primary, fontWeight: '500' },
});

export default PropertyDetails;