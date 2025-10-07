import React, { useState, useCallback } from "react";
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

import {
  fetchPropertyDetails,
  addSpace,
  addAsset,
  addHistory,
} from "../../services/propertyDetails";
import { fetchAssetTypes } from "../../services/FetchAssetTypes";
import { propertyDetailsStyles as styles } from "../../styles/propertyDetailsStyles";
import { PALETTE } from "../../styles/palette";
import type {
  SpaceWithAssets,
  AssetWithChangelog,
  EditableSpec,
} from "../../types";

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

const SpecificationDetails = ({
  specifications,
}: {
  specifications: Record<string, any>;
}) => (
  <View style={styles.specificationsBox}>
    {Object.entries(specifications).map(([key, value]) => (
      <View key={key} style={styles.specPair}>
        <Text style={styles.specKey}>{key.replace(/_/g, " ")}</Text>
        <Text style={styles.specValue}>{String(value)}</Text>
      </View>
    ))}
  </View>
);

const AssetAccordion = ({
  asset,
  isExpanded,
  onToggle,
  onAddHistory,
}: {
  asset: AssetWithChangelog;
  isExpanded: boolean;
  onToggle: () => void;
  onAddHistory: (asset: AssetWithChangelog) => void;
}) => {
  const [expandedHistoryId, setExpandedHistoryId] = useState<string | null>(
    null
  );
  const acceptedLogs = asset.ChangeLog.filter(
    (log) => log.status === "ACCEPTED"
  );
  const latestChange = acceptedLogs[0] || null;

  return (
    <View style={styles.assetContainer}>
      <TouchableOpacity style={styles.assetHeader} onPress={onToggle}>
        <Text style={styles.assetTitle}>{asset.description}</Text>
        {isExpanded ? (
          <ChevronDown color={PALETTE.textPrimary} size={20} />
        ) : (
          <ChevronRight color={PALETTE.textPrimary} size={20} />
        )}
      </TouchableOpacity>
      {isExpanded && (
        <View style={styles.assetContent}>
          <Text style={styles.contentSectionTitle}>Current Specifications</Text>
          {latestChange ? (
            <SpecificationDetails
              specifications={latestChange.specifications}
            />
          ) : (
            <Text style={styles.emptyText}>
              No accepted specifications yet.
            </Text>
          )}
          <View style={styles.historySectionHeader}>
            <Text style={styles.contentSectionTitle}>History</Text>
            <TouchableOpacity
              style={styles.addButtonSmall}
              onPress={() => onAddHistory(asset)}
            >
              <PlusCircle size={18} color={PALETTE.primary} />
              <Text style={styles.addButtonSmallText}>Add Entry</Text>
            </TouchableOpacity>
          </View>
          {acceptedLogs.length > 1 ? (
            acceptedLogs.slice(1).map((entry) => (
              <View key={entry.id} style={styles.historyItemContainer}>
                <TouchableOpacity
                  style={styles.historyEntry}
                  onPress={() =>
                    setExpandedHistoryId((prev) =>
                      prev === entry.id ? null : entry.id
                    )
                  }
                >
                  <View style={styles.historyHeader}>
                    <Text style={styles.historyDate}>
                      {new Date(entry.created_at).toLocaleString()}
                    </Text>
                    {expandedHistoryId === entry.id ? (
                      <ChevronDown color={PALETTE.textSecondary} size={16} />
                    ) : (
                      <ChevronRight color={PALETTE.textSecondary} size={16} />
                    )}
                  </View>
                  <Text style={styles.historyDescription}>
                    “{entry.change_description}”
                  </Text>
                  <Text style={styles.historyAuthor}>
                    By:{" "}
                    {entry.User
                      ? `${entry.User.first_name} ${entry.User.last_name}`
                      : "System"}
                  </Text>
                </TouchableOpacity>
                {expandedHistoryId === entry.id && (
                  <View style={styles.historySpecBox}>
                    <SpecificationDetails
                      specifications={entry.specifications}
                    />
                  </View>
                )}
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>
              No other accepted history entries.
            </Text>
          )}
        </View>
      )}
    </View>
  );
};

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
  const [selectedSpace, setSelectedSpace] = useState<string | null>(null);
  const [expandedAssetId, setExpandedAssetId] = useState<string | null>(null);
  
  // Sort mode state
  const [sortMode, setSortMode] = useState<'space' | 'discipline'>('space');
  const [selectedDiscipline, setSelectedDiscipline] = useState<string | null>(null);
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

  // Extract disciplines using existing assetTypes data
  const extractDisciplinesAndMapping = useCallback((spacesData: SpaceWithAssets[]) => {
    const disciplinesSet = new Set<string>();
    const mapping: Record<string, SpaceWithAssets[]> = {};

    spacesData.forEach(space => {
      space.Assets.forEach(asset => {
        const assetType = assetTypes.find(type => type.id === asset.asset_type_id);
        const discipline = assetType?.discipline || 'General';
        
        disciplinesSet.add(discipline);
        
        if (!mapping[discipline]) {
          mapping[discipline] = [];
        }
        
        const existingSpace = mapping[discipline].find(s => s.id === space.id);
        if (!existingSpace) {
          mapping[discipline].push(space);
        }
      });
    });

    const disciplines = Array.from(disciplinesSet).sort();
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
      Alert.alert(
        "Missing Information",
        "Please provide a name and select a type."
      );
      return;
    }
    try {
      await addSpace(propertyId, newSpaceName, newSpaceType);
      setNewSpaceName("");
      setNewSpaceType(null);
      setAddSpaceModalVisible(false);
    } catch (error: any) {
      Alert.alert("Error", error.message);
    }
  };

  const handleAddAsset = async () => {
    if (!newAssetDescription.trim() || !selectedAssetType || !selectedSpace) {
      Alert.alert(
        "Missing Information",
        "Please select an asset type and provide a description."
      );
      return;
    }
    try {
      await addAsset(newAssetDescription, selectedSpace, selectedAssetType);
      setNewAssetDescription("");
      setSelectedAssetType(null);
      setAddAssetModalVisible(false);
    } catch (error: any) {
      Alert.alert("Error", error.message);
    }
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

    try {
      await addHistory(currentAsset, newHistoryDescription, newSpecifications);
      setNewHistoryDescription("");
      setAddHistoryModalVisible(false);
      setCurrentAsset(null);
    } catch (error: any) {
      Alert.alert("Error", error.message);
    }
  };

  const openAddHistoryModal = (asset: AssetWithChangelog) => {
    setCurrentAsset(asset);
    const latestAcceptedLog = asset.ChangeLog.find(
      (log) => log.status === "ACCEPTED"
    );
    const latestSpecs = latestAcceptedLog?.specifications || {};
    const specsArray = Object.entries(latestSpecs).map(
      ([key, value], index) => ({
        id: index,
        key: key.charAt(0).toUpperCase() + key.slice(1),
        value: value as string,
      })
    );
    setEditableSpecs(specsArray);
    setAddHistoryModalVisible(true);
  };

  const handleSpecChange = (
    id: number,
    field: "key" | "value",
    value: string
  ) => {
    setEditableSpecs((prev) =>
      prev.map((spec) => (spec.id === id ? { ...spec, [field]: value } : spec))
    );
  };
  const addNewSpecRow = () =>
    setEditableSpecs((prev) => [
      ...prev,
      { id: Date.now(), key: "", value: "" },
    ]);
  const removeSpecRow = (id: number) =>
    setEditableSpecs((prev) => prev.filter((spec) => spec.id !== id));

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

  const currentSpace = spaces.find((s) => s.id === selectedSpace);
  const currentAssets = currentSpace?.Assets || [];
  const selectedSpaceName = currentSpace?.name || "Select a Space";
  
  const currentDisciplineSpaces = selectedDiscipline ? disciplineToSpacesMap[selectedDiscipline] || [] : [];
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
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <ChevronLeft size={24} color={PALETTE.textPrimary} />
        </TouchableOpacity>
        <View style={styles.dropdownContainer}>
          <DropField
            options={sortMode === 'space' ? spaces.map((s) => s.name) : availableDisciplines}
            selectedValue={sortMode === 'space' ? selectedSpaceName : selectedDisciplineName}
            onSelect={(name) => {
              if (sortMode === 'space') {
                const space = spaces.find((s) => s.name === name);
                if (space) {
                  setSelectedSpace(space.id);
                  setExpandedAssetId(null);
                }
              } else {
                setSelectedDiscipline(name);
                setExpandedAssetId(null);
              }
            }}
          />
        </View>
        <TouchableOpacity
          style={styles.sortModeButton}
          onPress={toggleSortMode}
        >
          <Text style={styles.sortModeButtonText}>
            {sortMode === 'space' ? 'Space' : 'Discipline'}
          </Text>
        </TouchableOpacity>
      </View>
      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.pageTitle}>
          {sortMode === 'space' ? selectedSpaceName : selectedDisciplineName}
        </Text>
        <View style={styles.contentContainer}>
          {sortMode === 'space' ? (
            // Space mode - show assets for selected space
            currentAssets.length > 0 ? (
              currentAssets.map((asset) => (
                <AssetAccordion
                  key={asset.id}
                  asset={asset}
                  isExpanded={expandedAssetId === asset.id}
                  onToggle={() =>
                    setExpandedAssetId((prev) =>
                      prev === asset.id ? null : asset.id
                    )
                  }
                  onAddHistory={openAddHistoryModal}
                />
              ))
            ) : (
              <View style={styles.centerContainer}>
                <Text style={styles.emptyText}>
                  No assets found in this space.
                </Text>
              </View>
            )
          ) : (
            // Discipline mode - show spaces with assets of selected discipline
            currentDisciplineSpaces.length > 0 ? (
              currentDisciplineSpaces.map((space) => {
                const filteredAssets = space.Assets.filter((asset) => {
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
                          onToggle={() =>
                            setExpandedAssetId((prev) =>
                              prev === asset.id ? null : asset.id
                            )
                          }
                          onAddHistory={openAddHistoryModal}
                        />
                      ))
                    ) : (
                      <Text style={styles.emptyText}>
                        No {selectedDiscipline} assets in this space.
                      </Text>
                    )}
                  </View>
                );
              })
            ) : (
              <View style={styles.centerContainer}>
                <Text style={styles.emptyText}>
                  No spaces found with {selectedDiscipline} assets.
                </Text>
              </View>
            )
          )}
        </View>
      </ScrollView>
      <View style={styles.headerActions}>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setAddSpaceModalVisible(true)}
        >
          <PlusCircle size={20} color={PALETTE.primary} />
          <Text style={styles.addButtonText}>Add Space</Text>
        </TouchableOpacity>
        {selectedSpace && (
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setAddAssetModalVisible(true)}
          >
            <PlusCircle size={20} color={PALETTE.primary} />
            <Text style={styles.addButtonText}>Add Asset</Text>
          </TouchableOpacity>
        )}
      </View>

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
        <DropField
          options={spaceTypeOptions}
          selectedValue={newSpaceType || undefined}
          onSelect={setNewSpaceType}
          placeholder="Select a space type..."
        />
      </FormModal>

      <FormModal
        visible={isAddAssetModalVisible}
        onClose={() => setAddAssetModalVisible(false)}
        title={`Add Asset to ${selectedSpaceName}`}
        onSubmit={handleAddAsset}
      >
        <DropField
          options={assetTypes.map((t) => t.name)}
          selectedValue={
            assetTypes.find((t) => t.id === selectedAssetType)?.name
          }
          onSelect={(name) => {
            const type = assetTypes.find((t) => t.name === name);
            setSelectedAssetType(type ? type.id : null);
          }}
          placeholder="Select an asset type..."
          style={{ marginBottom: 12 }}
        />
        <TextInput
          style={styles.input}
          placeholder="Asset Description (e.g., Air Conditioner)"
          value={newAssetDescription}
          onChangeText={setNewAssetDescription}
        />
      </FormModal>

      <FormModal
        visible={isAddHistoryModalVisible}
        onClose={() => setAddHistoryModalVisible(false)}
        title={`Update ${currentAsset?.description}`}
        onSubmit={handleAddHistory}
        submitText="Submit Update"
      >
        <Text style={styles.label}>Update Description</Text>
        <TextInput
          style={[styles.input, { height: 80 }]}
          placeholder="Describe the change or update..."
          value={newHistoryDescription}
          onChangeText={setNewHistoryDescription}
          multiline
        />
        <Text style={styles.label}>Specifications</Text>
        {editableSpecs.map((spec) => (
          <View key={spec.id} style={styles.specRow}>
            <TextInput
              style={[styles.input, styles.specInputKey]}
              placeholder="Attribute"
              value={spec.key}
              onChangeText={(text) => handleSpecChange(spec.id, "key", text)}
            />
            <TextInput
              style={[styles.input, styles.specInputValue]}
              placeholder="Value"
              value={spec.value}
              onChangeText={(text) => handleSpecChange(spec.id, "value", text)}
            />
            <TouchableOpacity
              onPress={() => removeSpecRow(spec.id)}
              style={styles.removeRowButton}
            >
              <Trash2 size={20} color={PALETTE.danger} />
            </TouchableOpacity>
          </View>
        ))}
        <TouchableOpacity style={styles.addRowButton} onPress={addNewSpecRow}>
          <PlusCircle size={20} color={PALETTE.primary} />
          <Text style={styles.addRowButtonText}>Add Attribute</Text>
        </TouchableOpacity>
      </FormModal>
    </SafeAreaView>
  );
};

export default PropertyDetails;
