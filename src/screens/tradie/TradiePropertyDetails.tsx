import React, { useState, useCallback, useEffect } from "react";
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
import {
  useFocusEffect,
  useRoute,
  useNavigation,
} from "@react-navigation/native";
import {
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  PlusCircle,
  Trash2,
} from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { DropField, FormModal, AssetAccordion } from "../../components";

import { fetchPropertyAndJobScope } from "../../services/PropertyService";
import { fetchAssetTypes } from "../../services/PropertyService";
import { addHistoryTradie } from "../../services/PropertyService";
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

// All duplicate inline UI implementations (FormModal, AssetAccordion, SpecificationDetails) 
// have been extracted to src/components/ to keep this screen clean and strictly focused on logic.

export default function TradiePropertyDetails() {
  const route = useRoute();
  const navigation = useNavigation();
  const { propertyId, jobId } = route.params as {
    propertyId: string;
    jobId: string;
  };
  const [loading, setLoading] = useState(true);
  const [spaces, setSpaces] = useState<SpaceWithAssets[]>([]);
  const [editableAssetIds, setEditableAssetIds] = useState(new Set());
  const [assetTypes, setAssetTypes] = useState<
    { id: number; name: string; discipline: string }[]
  >([]);
  const [selectedSpace, setSelectedSpace] = useState<string | null>("All");
  const [expandedAssetId, setExpandedAssetId] = useState<string | null>(null);
  const [isAddHistoryModalVisible, setAddHistoryModalVisible] = useState(false);
  const [currentAsset, setCurrentAsset] = useState<AssetWithChangelog | null>(
    null,
  );
  const [newHistoryDescription, setNewHistoryDescription] = useState("");
  const [editableSpecs, setEditableSpecs] = useState<EditableSpec[]>([]);

  const [sortMode, setSortMode] = useState<"space" | "discipline">("space");
  const [selectedDiscipline, setSelectedDiscipline] = useState<string | null>(
    "All",
  );
  const [availableDisciplines, setAvailableDisciplines] = useState<string[]>(
    [],
  );
  const [disciplineToSpacesMap, setDisciplineToSpacesMap] = useState<
    Record<string, SpaceWithAssets[]>
  >({});

  const extractDisciplinesAndMapping = useCallback(
    (spacesData: SpaceWithAssets[]) => {
      const disciplinesSet = new Set<string>();
      const mapping: Record<string, SpaceWithAssets[]> = {};

      spacesData.forEach((space) => {
        space.Assets.forEach((asset) => {
          const assetType = assetTypes.find(
            (type) => type.id === asset.asset_type_id,
          );
          const discipline = assetType?.discipline || "General";

          disciplinesSet.add(discipline);

          if (!mapping[discipline]) {
            mapping[discipline] = [];
          }

          const existingSpace = mapping[discipline].find(
            (s) => s.id === space.id,
          );
          if (!existingSpace) {
            mapping[discipline].push(space);
          }
        });
      });

      const disciplines = Array.from(disciplinesSet).sort();
      setAvailableDisciplines(disciplines);
      setDisciplineToSpacesMap(mapping);

      if (
        sortMode === "discipline" &&
        !selectedDiscipline &&
        disciplines.length > 0
      ) {
        setSelectedDiscipline(disciplines[0]);
      }
    },
    [assetTypes, sortMode, selectedDiscipline],
  );

  useFocusEffect(
    useCallback(() => {
      const loadData = async () => {
        setLoading(true);
        try {
          const [scopeData, fetchedAssetTypes] = await Promise.all([
            fetchPropertyAndJobScope(propertyId, jobId),
            fetchAssetTypes(),
          ]);

          if (scopeData.property && scopeData.property.Spaces) {
            const transformedSpaces: SpaceWithAssets[] =
              scopeData.property.Spaces.map((space: any) => ({
                ...space,
                Assets: space.Assets.map((asset: any) => ({
                  ...asset,
                  ChangeLog: asset.ChangeLog.map((log: any) => ({
                    ...log,
                    User: Array.isArray(log.User) ? log.User[0] : log.User,
                  })),
                })),
              }));

            setSpaces(transformedSpaces);
            setEditableAssetIds(scopeData.editableAssetIds);
            if (scopeData.property.Spaces.length > 0 && !selectedSpace) {
              setSelectedSpace(scopeData.property.Spaces[0].id);
            }
          }
          setAssetTypes(fetchedAssetTypes);
        } catch (err: any) {
          Alert.alert("Error", "Could not load property data.");
        } finally {
          setLoading(false);
        }
      };

      loadData();
    }, [propertyId, jobId, selectedSpace]),
  );

  useFocusEffect(
    useCallback(() => {
      if (spaces.length > 0 && assetTypes.length > 0) {
        extractDisciplinesAndMapping(spaces);
      }
    }, [spaces, assetTypes, extractDisciplinesAndMapping]),
  );

  const handleAddHistory = async () => {
    if (!newHistoryDescription.trim() || !currentAsset) {
      Alert.alert("Missing Information", "Please provide a description.");
      return;
    }
    const newSpecifications = editableSpecs.reduce(
      (acc, spec) => {
        if (spec.key.trim()) acc[spec.key.trim()] = spec.value.trim();
        return acc;
      },
      {} as Record<string, string>,
    );

    Alert.alert(
      "Submit Update",
      `Submit this update for ${currentAsset?.description}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Submit",
          onPress: async () => {
            try {
              await addHistoryTradie(
                currentAsset,
                newHistoryDescription,
                newSpecifications,
              );
              setNewHistoryDescription("");
              setEditableSpecs([]);
              setAddHistoryModalVisible(false);
              setCurrentAsset(null);
            } catch (error: any) {
              Alert.alert("Error", error.message);
            }
          },
        },
      ],
      { cancelable: true },
    );
  };

  const openAddHistoryModal = (asset: AssetWithChangelog) => {
    setCurrentAsset(asset);
    const latestAcceptedLog = asset.ChangeLog.find(
      (log) => log.status === "ACCEPTED",
    );
    const latestSpecs = latestAcceptedLog?.specifications || {};
    const specsArray = Object.entries(latestSpecs).map(
      ([key, value], index) => ({
        id: index,
        key: key,
        value: value as string,
      }),
    );
    setEditableSpecs(specsArray);
    setAddHistoryModalVisible(true);
  };

  const handleSpecChange = (
    id: number,
    field: "key" | "value",
    value: string,
  ) => {
    setEditableSpecs((prev) =>
      prev.map((spec) => (spec.id === id ? { ...spec, [field]: value } : spec)),
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
      "Delete Attribute",
      key
        ? `Delete attribute "${key}"? This cannot be undone.`
        : "Delete this attribute? This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => removeSpecRowInternal(id),
        },
      ],
      { cancelable: true },
    );
  };

  const currentSpace =
    selectedSpace === "All" ? null : spaces.find((s) => s.id === selectedSpace);
  const currentAssets =
    selectedSpace === "All" ? [] : currentSpace?.Assets || [];
  const selectedSpaceName =
    selectedSpace === "All" ? "All" : currentSpace?.name || "Select a Space";

  const currentDisciplineSpaces =
    selectedDiscipline === "All"
      ? spaces
      : selectedDiscipline
        ? disciplineToSpacesMap[selectedDiscipline] || []
        : [];
  const selectedDisciplineName = selectedDiscipline || "Select a Discipline";

  if (loading) {
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
        <Text style={styles.headerTitle} numberOfLines={1}>
          {"Timeline"}
        </Text>
        <View style={{ width: 40 }} />
      </View>
      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.sortSection}>
          <Text style={styles.sortLabel}>Sort by:</Text>
          <View style={styles.sortToggleGroup}>
            <TouchableOpacity
              style={[
                styles.sortToggleButton,
                sortMode === "space" && styles.sortToggleButtonActive,
              ]}
              onPress={() => setSortMode("space")}
            >
              <Text
                style={[
                  styles.sortToggleText,
                  sortMode === "space" && styles.sortToggleTextActive,
                ]}
              >
                Space
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.sortToggleButton,
                sortMode === "discipline" && styles.sortToggleButtonActive,
              ]}
              onPress={() => setSortMode("discipline")}
            >
              <Text
                style={[
                  styles.sortToggleText,
                  sortMode === "discipline" && styles.sortToggleTextActive,
                ]}
              >
                Discipline
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.dropdownWrapper}>
            <DropField
              options={
                sortMode === "space"
                  ? ["All", ...spaces.map((s) => s.name)]
                  : ["All", ...availableDisciplines]
              }
              selectedValue={
                sortMode === "space"
                  ? selectedSpaceName
                  : selectedDisciplineName
              }
              onSelect={(name) => {
                if (sortMode === "space") {
                  if (name === "All") {
                    setSelectedSpace("All");
                  } else {
                    const space = spaces.find((s) => s.name === name);
                    if (space) {
                      setSelectedSpace(space.id);
                    }
                  }
                  setExpandedAssetId(null);
                } else {
                  if (name === "All") {
                    setSelectedDiscipline("All");
                  } else {
                    setSelectedDiscipline(name);
                  }
                  setExpandedAssetId(null);
                }
              }}
            />
          </View>
        </View>

        <Text style={styles.pageTitle}>
          {sortMode === "space" ? selectedSpaceName : selectedDisciplineName}
        </Text>
        <View style={styles.contentContainer}>
          {sortMode === "space" ? (
            selectedSpace === "All" ? (
              spaces.length > 0 ? (
                spaces.map((space) => (
                  <View key={space.id} style={styles.disciplineSpaceContainer}>
                    <Text style={styles.disciplineSpaceTitle}>
                      {space.name}
                    </Text>
                    {space.Assets.length > 0 ? (
                      space.Assets.map((asset) => (
                        <AssetAccordion
                          key={asset.id}
                          asset={asset}
                          isExpanded={expandedAssetId === asset.id}
                          onToggle={() =>
                            setExpandedAssetId((prev) =>
                              prev === asset.id ? null : asset.id,
                            )
                          }
                          onAddHistory={openAddHistoryModal}
                          isEditable={editableAssetIds.has(asset.id)}
                        />
                      ))
                    ) : (
                      <Text style={styles.emptyText}>
                        No assets in this space.
                      </Text>
                    )}
                  </View>
                ))
              ) : (
                <View style={styles.centerContainer}>
                  <Text style={styles.emptyText}>No spaces found.</Text>
                </View>
              )
            ) : currentAssets.length > 0 ? (
              currentAssets.map((asset) => (
                <AssetAccordion
                  key={asset.id}
                  asset={asset}
                  isExpanded={expandedAssetId === asset.id}
                  onToggle={() =>
                    setExpandedAssetId((prev) =>
                      prev === asset.id ? null : asset.id,
                    )
                  }
                  onAddHistory={openAddHistoryModal}
                  isEditable={editableAssetIds.has(asset.id)}
                />
              ))
            ) : (
              <View style={styles.centerContainer}>
                <Text style={styles.emptyText}>
                  No assets found in this space.
                </Text>
              </View>
            )
          ) : currentDisciplineSpaces.length > 0 ? (
            currentDisciplineSpaces.map((space) => {
              const filteredAssets =
                selectedDiscipline === "All"
                  ? space.Assets
                  : space.Assets.filter((asset) => {
                      const assetType = assetTypes.find(
                        (type) => type.id === asset.asset_type_id,
                      );
                      const discipline = assetType?.discipline || "General";
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
                            prev === asset.id ? null : asset.id,
                          )
                        }
                        onAddHistory={openAddHistoryModal}
                        isEditable={editableAssetIds.has(asset.id)}
                      />
                    ))
                  ) : (
                    <Text style={styles.emptyText}>
                      {selectedDiscipline === "All"
                        ? "No assets in this space."
                        : `No ${selectedDiscipline} assets in this space.`}
                    </Text>
                  )}
                </View>
              );
            })
          ) : (
            <View style={styles.centerContainer}>
              <Text style={styles.emptyText}>
                {selectedDiscipline === "All"
                  ? "No spaces found."
                  : `No spaces found with ${selectedDiscipline} assets.`}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

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
              onPress={() => requestRemoveSpecRow(spec.id, spec.key)}
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
}
