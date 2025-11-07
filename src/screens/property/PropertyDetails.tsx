import React, { useState, useCallback, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Platform,
  UIManager,
  Modal,
  TextInput,
  Alert,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import {
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  PlusCircle,
  X,
  Trash2,
} from "lucide-react-native";
import { SafeAreaView } from 'react-native-safe-area-context'; 
import { DropField } from "../../components";
import ConfirmModal from "../../components/ConfirmModal";
import SpecificationDetails from '../../components/SpecificationDetails';
import AssetAccordion from '../../components/AssetAccordion';

import {
  fetchPropertyDetails,
  addSpace,
  addAsset,
  addHistoryOwner,
} from "../../services/propertyDetails";
import { fetchAssetTypes } from "../../services/FetchAssetTypes";
import { propertyDetailsStyles as styles } from "../../styles/propertyDetailsStyles";
import { PALETTE } from "../../styles/palette";
import type {
  SpaceWithAssets,
  AssetWithChangelog,
  EditableSpec,
} from "../../types";
import { getDisciplinesAndMapping } from '../../utils/propertyHelpers';

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const FormModal = ({
  visible,
  onClose,
  title,
  children,
  onSubmit,
  submitText = "Add",
}: any) => (
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
        <ScrollView keyboardShouldPersistTaps="handled">{children}</ScrollView>
        <TouchableOpacity style={styles.submitButton} onPress={onSubmit}>
          <Text style={styles.submitButtonText}>{submitText}</Text>
        </TouchableOpacity>
      </View>
    </View>
  </Modal>
);

// SpecificationDetails and AssetAccordion are now extracted to separate files

const PropertyDetails = ({
  route,
  navigation,
}: {
  route: any;
  navigation: any;
}) => {
  const { propertyId } = route.params || {};

  const [loading, setLoading] = useState(true);
  const [spaces, setSpaces] = useState<SpaceWithAssets[]>([]);
  const [assetTypes, setAssetTypes] = useState<{ id: number; name: string; discipline: string }[]>(
    []
  );
  const [selectedSpace, setSelectedSpace] = useState<string | null>("All");
  const [expandedAssetId, setExpandedAssetId] = useState<string | null>(null);
  
  const [sortMode, setSortMode] = useState<'space' | 'discipline'>('space');
  const [selectedDiscipline, setSelectedDiscipline] = useState<string | null>("All");
  const [availableDisciplines, setAvailableDisciplines] = useState<string[]>([]);
  const [disciplineToSpacesMap, setDisciplineToSpacesMap] = useState<Record<string, SpaceWithAssets[]>>({});

  const [isAddSpaceModalVisible, setAddSpaceModalVisible] = useState(false);
  const [isAddAssetModalVisible, setAddAssetModalVisible] = useState(false);
  const [isAddHistoryModalVisible, setAddHistoryModalVisible] = useState(false);
  const [currentAsset, setCurrentAsset] = useState<AssetWithChangelog | null>(
    null
  );

  const [newSpaceName, setNewSpaceName] = useState("");
  const [newSpaceType, setNewSpaceType] = useState<string | null>(null);
  const [newAssetDescription, setNewAssetDescription] = useState("");
  const [selectedAssetType, setSelectedAssetType] = useState<number | null>(
    null
  );
  const [newHistoryDescription, setNewHistoryDescription] = useState("");
  const [editableSpecs, setEditableSpecs] = useState<EditableSpec[]>([]);

  // Confirmation modal state & ref for deferred actions
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [confirmTitle, setConfirmTitle] = useState('');
  const [confirmMessage, setConfirmMessage] = useState('');
  const [confirmDestructive, setConfirmDestructive] = useState(false);
  const onConfirmRef = useRef<(() => Promise<void>) | null>(null);

  const spaceTypeOptions = [
    "Bedroom",
    "Bathroom",
    "Kitchen",
    "Living Area",
    "Hallway",
    "Laundry",
    "Garage",
    "Exterior",
    "Garden",
    "Other",
  ];

  const extractDisciplinesAndMapping = useCallback((spacesData: SpaceWithAssets[]) => {
    const { disciplines, mapping } = getDisciplinesAndMapping(spacesData, assetTypes);
    setAvailableDisciplines(disciplines);
    setDisciplineToSpacesMap(mapping);

    if (sortMode === 'discipline' && !selectedDiscipline && disciplines.length > 0) {
      setSelectedDiscipline(disciplines[0]);
    }
  }, [assetTypes, sortMode, selectedDiscipline]);

  useFocusEffect(
    useCallback(() => {
      const loadData = async () => {
        setLoading(true);
        try {
          const [propertyData, fetchedAssetTypes] = await Promise.all([
            fetchPropertyDetails(propertyId),
            fetchAssetTypes(),
          ]);
          if (propertyData && propertyData.Spaces) {
            setSpaces(propertyData.Spaces);
            if (propertyData.Spaces.length > 0 && !selectedSpace) {
              setSelectedSpace(propertyData.Spaces[0].id);
            }
          }
          setAssetTypes(fetchedAssetTypes);
        } catch (err: any) {
          Alert.alert("Error", "Could not load property data.");
          console.error(err.message);
        } finally {
          setLoading(false);
        }
      };

      loadData();
    }, [propertyId, selectedSpace])
  );

  useFocusEffect(
    useCallback(() => {
      if (spaces.length > 0 && assetTypes.length > 0) {
        extractDisciplinesAndMapping(spaces);
      }
    }, [spaces, assetTypes, extractDisciplinesAndMapping])
  );

  const handleAddSpace = async () => {
    if (!newSpaceName.trim() || !newSpaceType) {
      Alert.alert("Missing Information", "Please provide a name and select a type.");
      return;
    }
    Alert.alert(
      'Add Space',
      `Create new space "${newSpaceName}" of type "${newSpaceType}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Add',
          onPress: async () => {
            try {
              await addSpace(propertyId, newSpaceName, newSpaceType);
              setNewSpaceName('');
              setNewSpaceType(null);
              setAddSpaceModalVisible(false);
            } catch (error: any) {
              Alert.alert('Error', error.message);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const handleAddAsset = async () => {
    if (!newAssetDescription.trim() || !selectedAssetType || !selectedSpace) {
      Alert.alert("Missing Information", "Please select an asset type and provide a description.");
      return;
    }
    Alert.alert(
      'Add Asset',
      `Add "${newAssetDescription}" to the selected space?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Add',
          onPress: async () => {
            try {
              await addAsset(newAssetDescription, selectedSpace, selectedAssetType);
              setNewAssetDescription('');
              setSelectedAssetType(null);
              setAddAssetModalVisible(false);
            } catch (error: any) {
              Alert.alert('Error', error.message);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const handleAddHistory = async () => {
    if (!newHistoryDescription.trim() || !currentAsset) {
      Alert.alert("Missing Information", "Please provide a description.");
      return;
    }
    const newSpecifications = editableSpecs.reduce((acc, spec) => {
      if (spec.key.trim()) {
        acc[spec.key.trim()] = spec.value.trim();
      }
      return acc;
    }, {} as Record<string, string>);

    Alert.alert(
      'Submit Update',
      `Submit this update for ${currentAsset?.description}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Submit',
          onPress: async () => {
            try {
              await addHistoryOwner(currentAsset, newHistoryDescription, newSpecifications);
              setNewHistoryDescription('');
              setAddHistoryModalVisible(false);
              setCurrentAsset(null);
            } catch (error: any) {
              Alert.alert('Error', error.message);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const openAddHistoryModal = (asset: AssetWithChangelog) => {
    setCurrentAsset(asset);
    const latestAcceptedLog = asset.ChangeLog.find(
      (log) => log.status === "ACCEPTED"
    );
    const latestSpecs = latestAcceptedLog?.specifications || {};
    // FIX: Preserve the original key format when preparing for editing.
    const specsArray = Object.entries(latestSpecs).map(
      ([key, value], index) => ({
        id: index,
        key: key, // Use the key directly from the database
        value: value as string,
      })
    );
    setEditableSpecs(specsArray);
    setAddHistoryModalVisible(true);
  };

  const handleSpecChange = (id: number, field: "key" | "value", value: string) => {
    setEditableSpecs((prev) =>
      prev.map((spec) => (spec.id === id ? { ...spec, [field]: value } : spec))
    );
  };
  const addNewSpecRow = () =>
    setEditableSpecs((prev) => [
      ...prev,
      { id: Date.now(), key: "", value: "" },
    ]);
  const removeSpecRowInternal = (id: number) =>
    setEditableSpecs((prev) => prev.filter((spec) => spec.id !== id));

  const requestRemoveSpecRow = (id: number, key?: string) => {
    Alert.alert(
      'Delete Attribute',
      key ? `Delete attribute "${key}"? This cannot be undone.` : 'Delete this attribute? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => removeSpecRowInternal(id) },
      ],
      { cancelable: true }
    );
  };

  const toggleSortMode = () => {
    if (sortMode === 'space') {
      setSortMode('discipline');
      if (availableDisciplines.length > 0 && !selectedDiscipline) {
        setSelectedDiscipline(availableDisciplines[0]);
      }
    } else {
      setSortMode('space');
      setSelectedDiscipline(null);
    }
  };

  const currentSpace = selectedSpace === 'All' ? null : spaces.find((s) => s.id === selectedSpace);
  const currentAssets = selectedSpace === 'All' ? [] : (currentSpace?.Assets || []);
  const selectedSpaceName = selectedSpace === 'All' ? 'All' : (currentSpace?.name || "Select a Space");
  
  const currentDisciplineSpaces = selectedDiscipline === 'All' ? spaces : (selectedDiscipline ? disciplineToSpacesMap[selectedDiscipline] || [] : []);
  const selectedDisciplineName = selectedDiscipline || "Select a Discipline";

  if (loading && !spaces.length) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <ActivityIndicator size="large" color={PALETTE.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <ChevronLeft size={24} color={PALETTE.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {"Timeline"}
        </Text>
        <View style={{ width: 40 }} />
      </View>
      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        
      {/* Sort by Section */}
      <View style={styles.sortSection}>
        <Text style={styles.sortLabel}>Sort by:</Text>
        <View style={styles.sortToggleGroup}>
          <TouchableOpacity
            style={[styles.sortToggleButton, sortMode === 'space' && styles.sortToggleButtonActive]}
            onPress={() => setSortMode('space')}
          >
            <Text
              style={[
                styles.sortToggleText,
                sortMode === 'space' && styles.sortToggleTextActive,
              ]}
            >
              Space
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.sortToggleButton, sortMode === 'discipline' && styles.sortToggleButtonActive]}
            onPress={() => setSortMode('discipline')}
          >
            <Text
              style={[
                styles.sortToggleText,
                sortMode === 'discipline' && styles.sortToggleTextActive,
              ]}
            >
              Discipline
            </Text>
          </TouchableOpacity>
          </View>
          <View style={styles.dropdownWrapper}>
            <DropField
              options={sortMode === 'space' ? ['All', ...spaces.map((s) => s.name)] : ['All', ...availableDisciplines]}
              selectedValue={sortMode === 'space' ? selectedSpaceName : selectedDisciplineName}
              onSelect={(name) => {
                if (sortMode === 'space') {
                  if (name === 'All') {
                    setSelectedSpace('All');
                  } else {
                    const space = spaces.find((s) => s.name === name);
                    if (space) {
                      setSelectedSpace(space.id);
                    }
                  }
                  setExpandedAssetId(null);
                } else {
                  if (name === 'All') {
                    setSelectedDiscipline('All');
                  } else {
                    setSelectedDiscipline(name);
                  }
                  setExpandedAssetId(null);
                }
              }}
            />
          </View>
        </View>

        <Text style={styles.pageTitle}>{sortMode === 'space' ? selectedSpaceName : selectedDisciplineName}</Text>
        <View style={styles.contentContainer}>
          {sortMode === 'space' ? (
            selectedSpace === 'All' ? (
              spaces.length > 0 ? (
                spaces.map((space) => (
                  <View key={space.id} style={styles.disciplineSpaceContainer}>
                    <Text style={styles.disciplineSpaceTitle}>{space.name}</Text>
                    {space.Assets.length > 0 ? (
                      space.Assets.map((asset) => (
                        <AssetAccordion
                          key={asset.id}
                          asset={asset}
                          isExpanded={expandedAssetId === asset.id}
                          onToggle={() => setExpandedAssetId((prev) => prev === asset.id ? null : asset.id)}
                          onAddHistory={openAddHistoryModal}
                        />
                      ))
                    ) : (
                      <Text style={styles.emptyText}>No assets in this space.</Text>
                    )}
                  </View>
                ))
              ) : (
                <View style={styles.centerContainer}><Text style={styles.emptyText}>No spaces found.</Text></View>
              )
            ) : (
              currentAssets.length > 0 ? (
                currentAssets.map((asset) => (
                  <AssetAccordion
                    key={asset.id}
                    asset={asset}
                    isExpanded={expandedAssetId === asset.id}
                    onToggle={() => setExpandedAssetId((prev) => prev === asset.id ? null : asset.id)}
                    onAddHistory={openAddHistoryModal}
                  />
                ))
              ) : (
                <View style={styles.centerContainer}><Text style={styles.emptyText}>No assets found in this space.</Text></View>
              )
            )
          ) : (
            currentDisciplineSpaces.length > 0 ? (
              currentDisciplineSpaces.map((space) => {
                const filteredAssets = selectedDiscipline === 'All' 
                  ? space.Assets 
                  : space.Assets.filter((asset) => {
                      const assetType = assetTypes.find(type => type.id === asset.asset_type_id);
                      const discipline = assetType?.discipline || 'General';
                      return discipline === selectedDiscipline;
                    });
                
                return (
                  <View key={space.id} style={styles.disciplineSpaceContainer}>
                    <Text style={styles.disciplineSpaceTitle}>{space.name}</Text>
                    {filteredAssets.length > 0 ? (
                      filteredAssets.map((asset) => (
                        <AssetAccordion
                          key={asset.id}
                          asset={asset}
                          isExpanded={expandedAssetId === asset.id}
                          onToggle={() => setExpandedAssetId((prev) => prev === asset.id ? null : asset.id)}
                          onAddHistory={openAddHistoryModal}
                        />
                      ))
                    ) : (
                      <Text style={styles.emptyText}>
                        {selectedDiscipline === 'All' 
                          ? 'No assets in this space.' 
                          : `No ${selectedDiscipline} assets in this space.`
                        }
                      </Text>
                    )}
                  </View>
                );
              })
            ) : (
              <View style={styles.centerContainer}>
                <Text style={styles.emptyText}>
                  {selectedDiscipline === 'All' 
                    ? 'No spaces found.' 
                    : `No spaces found with ${selectedDiscipline} assets.`
                  }
                </Text>
              </View>
            )
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

      <FormModal visible={isAddSpaceModalVisible} onClose={() => setAddSpaceModalVisible(false)} title="Add New Space" onSubmit={handleAddSpace}>
        <TextInput style={styles.input} placeholder="Space Name (e.g., Main Bedroom)" value={newSpaceName} onChangeText={setNewSpaceName} />
        <DropField options={spaceTypeOptions} selectedValue={newSpaceType || undefined} onSelect={setNewSpaceType} placeholder="Select a space type..." />
      </FormModal>

      <FormModal visible={isAddAssetModalVisible} onClose={() => setAddAssetModalVisible(false)} title={`Add Asset to ${selectedSpaceName}`} onSubmit={handleAddAsset}>
        <DropField options={assetTypes.map((t) => t.name)} selectedValue={assetTypes.find((t) => t.id === selectedAssetType)?.name} onSelect={(name) => {
            const type = assetTypes.find((t) => t.name === name);
            setSelectedAssetType(type ? type.id : null);
          }} placeholder="Select an asset type..." style={{ marginBottom: 12 }} />
        <TextInput style={styles.input} placeholder="Asset Description (e.g., Air Conditioner)" value={newAssetDescription} onChangeText={setNewAssetDescription} />
      </FormModal>

      <FormModal visible={isAddHistoryModalVisible} onClose={() => setAddHistoryModalVisible(false)} title={`Update ${currentAsset?.description}`} onSubmit={handleAddHistory} submitText="Submit Update">
        <Text style={styles.label}>Update Description</Text>
        <TextInput style={[styles.input, { height: 80 }]} placeholder="Describe the change or update..." value={newHistoryDescription} onChangeText={setNewHistoryDescription} multiline />
        <Text style={styles.label}>Specifications</Text>
        {editableSpecs.map((spec) => (
          <View key={spec.id} style={styles.specRow}>
            <TextInput 
              style={[styles.input, styles.specInputKey]} 
              placeholder="Attribute" 
              value={spec.key} 
              onChangeText={(text) => handleSpecChange(spec.id, "key", text)} 
              multiline
              textAlignVertical="top"
            />
            <TextInput 
              style={[styles.input, styles.specInputValue]} 
              placeholder="Value" 
              value={spec.value} 
              onChangeText={(text) => handleSpecChange(spec.id, "value", text)} 
              multiline
              textAlignVertical="top"
            />
            <TouchableOpacity onPress={() => requestRemoveSpecRow(spec.id, spec.key)} style={styles.removeRowButton}>
              <Trash2 size={20} color={PALETTE.danger} />
            </TouchableOpacity>
          </View>
        ))}
        <TouchableOpacity style={styles.addRowButton} onPress={addNewSpecRow}>
          <PlusCircle size={20} color={PALETTE.primary} />
          <Text style={styles.addRowButtonText}>Add Attribute</Text>
        </TouchableOpacity>
      </FormModal>
      <ConfirmModal
        visible={confirmVisible}
        title={confirmTitle}
        message={confirmMessage}
        destructive={confirmDestructive}
        onConfirm={handleConfirm}
        onCancel={() => setConfirmVisible(false)}
      />
    </SafeAreaView>
  );
};

export default PropertyDetails;
