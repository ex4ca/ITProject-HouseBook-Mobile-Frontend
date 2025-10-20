import React, { useState, useCallback, useEffect, useRef } from "react";
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
import { useFocusEffect, useRoute, useNavigation } from "@react-navigation/native";
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

import { fetchPropertyAndJobScope } from "../../services/FetchAuthority"; 
import { fetchAssetTypes } from "../../services/FetchAssetTypes";
import { addHistoryTradie } from "../../services/propertyDetails";
import { ConfirmModal } from '../../components';
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

// --- Reusable Components ---

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
        <Text style={styles.specKey}>{key}</Text>
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
  isEditable,
}: {
  asset: AssetWithChangelog;
  isExpanded: boolean;
  onToggle: () => void;
  onAddHistory: (asset: AssetWithChangelog) => void;
  isEditable: boolean;
}) => {
  const [expandedHistoryId, setExpandedHistoryId] = useState<string | null>(null);
  const acceptedLogs = asset.ChangeLog.filter((log) => log.status === "ACCEPTED");
  const latestChange = acceptedLogs[0] || null;

  return (
    <View style={styles.assetContainer}>
      <TouchableOpacity style={styles.assetHeader} onPress={onToggle}>
        <Text style={styles.assetTitle}>{asset.description}</Text>
        {/* FIX 1: Use Chevron icons for accordion behavior */}
        {isExpanded ? (
             <ChevronDown size={20} color={PALETTE.textPrimary} />
        ) : (
             <ChevronRight size={20} color={PALETTE.textPrimary} />
        )}
      </TouchableOpacity>
      {isExpanded && (
        <View style={styles.assetContent}>
          <Text style={styles.contentSectionTitle}>Current Specifications</Text>
          {latestChange ? (
            <SpecificationDetails specifications={latestChange.specifications} />
          ) : (
            <Text style={styles.emptyText}>No specifications found.</Text>
          )}
          <View style={styles.historySectionHeader}>
            <Text style={styles.contentSectionTitle}>History</Text>
            {/* FIX 2: Show explicit permission message */}
            {isEditable ? (
              <TouchableOpacity
                style={styles.addButtonSmall}
                onPress={() => onAddHistory(asset)}
              >
                <PlusCircle size={18} color={PALETTE.primary} />
                <Text style={styles.addButtonSmallText}>Add Entry</Text>
              </TouchableOpacity>
            ) : (
              <Text style={styles.permissionText}>You don't have permission to edit.</Text>
            )}
          </View>
          {acceptedLogs.length > 1 ? (
            acceptedLogs.slice(1).map((entry) => (
              <View key={entry.id} style={styles.historyItemContainer}>
                  <TouchableOpacity
                    style={styles.historyEntry}
                    onPress={() => setExpandedHistoryId(prev => prev === entry.id ? null : entry.id)}
                  >
                    <View style={styles.historyHeader}>
                      <Text style={styles.historyDate}>{new Date(entry.created_at).toLocaleString()}</Text>
                      {expandedHistoryId === entry.id ? <ChevronDown color={PALETTE.textSecondary} size={16} /> : <ChevronRight color={PALETTE.textSecondary} size={16} />}
                    </View>
                    <Text style={styles.historyDescription}>“{entry.change_description}”</Text>
                    <Text style={styles.historyAuthor}>By: {entry.User ? `${entry.User.first_name} ${entry.User.last_name}` : "System"}</Text>
                  </TouchableOpacity>
                  {expandedHistoryId === entry.id && (
                    <View style={styles.historySpecBox}>
                      <SpecificationDetails specifications={entry.specifications} />
                    </View>
                  )}
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>No other history entries.</Text>
          )}
        </View>
      )}
    </View>
  );
};

// --- Main Tradie Property Details Component ---

export default function TradiePropertyDetails() {
  const route = useRoute();
  const navigation = useNavigation();
  const { propertyId, jobId } = route.params as { propertyId: string, jobId: string };
  const [loading, setLoading] = useState(true);
  const [spaces, setSpaces] = useState<SpaceWithAssets[]>([]);
  const [editableAssetIds, setEditableAssetIds] = useState(new Set());
  const [assetTypes, setAssetTypes] = useState<{ id: number; name: string; discipline: string }[]>([]);
  const [selectedSpace, setSelectedSpace] = useState<string | null>(null);
  const [expandedAssetId, setExpandedAssetId] = useState<string | null>(null);
  const [isAddHistoryModalVisible, setAddHistoryModalVisible] = useState(false);
  const [currentAsset, setCurrentAsset] = useState<AssetWithChangelog | null>(null);
  const [newHistoryDescription, setNewHistoryDescription] = useState("");
  const [editableSpecs, setEditableSpecs] = useState<EditableSpec[]>([]);

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
            const transformedSpaces: SpaceWithAssets[] = scopeData.property.Spaces.map((space: any) => ({
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
    }, [propertyId, jobId])
  );
  

  const handleAddHistory = async () => {
    if (!newHistoryDescription.trim() || !currentAsset) {
        Alert.alert("Missing Information", "Please provide a description.");
        return;
    }
    const newSpecifications = editableSpecs.reduce((acc, spec) => {
        if (spec.key.trim()) acc[spec.key.trim()] = spec.value.trim();
        return acc;
    }, {} as Record<string, string>);

  confirmRef.current = async () => {
    try {
      await addHistoryTradie(currentAsset, newHistoryDescription, newSpecifications);
      setNewHistoryDescription("");
      setEditableSpecs([]);
      setAddHistoryModalVisible(false);
      setCurrentAsset(null);
    } catch (error: any) {
      Alert.alert("Error", error.message);
    }
  };
  setConfirmTitle('Submit Update');
  setConfirmMessage(`Submit this update for ${currentAsset?.description}?`);
  setConfirmDestructive(false);
  setConfirmVisible(true);
  };

  const openAddHistoryModal = (asset: AssetWithChangelog) => {
    setCurrentAsset(asset);
    const latestAcceptedLog = asset.ChangeLog.find((log) => log.status === "ACCEPTED");
    const latestSpecs = latestAcceptedLog?.specifications || {};
    const specsArray = Object.entries(latestSpecs).map(([key, value], index) => ({
        id: index,
        key: key, 
        value: value as string,
    }));
    setEditableSpecs(specsArray);
    setAddHistoryModalVisible(true);
  };

  const confirmRef = useRef<() => Promise<void> | void>(() => {});
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [confirmTitle, setConfirmTitle] = useState<string | undefined>(undefined);
  const [confirmMessage, setConfirmMessage] = useState<string | undefined>(undefined);
  const [confirmDestructive, setConfirmDestructive] = useState(false);

  const handleSpecChange = (id: number, field: "key" | "value", value: string) => {
    setEditableSpecs((prev) => prev.map((spec) => (spec.id === id ? { ...spec, [field]: value } : spec)));
  };
  const addNewSpecRow = () => setEditableSpecs((prev) => [...prev, { id: Date.now(), key: "", value: "" }]);
  const removeSpecRow = (id: number) => setEditableSpecs((prev) => prev.filter((spec) => spec.id !== id));
  const currentSpace = spaces.find((s) => s.id === selectedSpace);
  const currentAssets = currentSpace?.Assets || [];
  const selectedSpaceName = currentSpace?.name || "Select a Space";

  if (loading) {
    return <SafeAreaView style={styles.centerContainer}><ActivityIndicator size="large" color={PALETTE.primary} /></SafeAreaView>;
  }

  return (
    <SafeAreaView style={styles.container}>
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


      <View style={styles.sortSection}>
        <Text style={styles.sortLabel}>Space:</Text>
        <View style={styles.dropdownWrapper}>
          <DropField
            options={spaces.map((s) => s.name)}
            selectedValue={selectedSpaceName}
            onSelect={(name) => {
              const space = spaces.find((s) => s.name === name);
              if (space) {
                setSelectedSpace(space.id);
                setExpandedAssetId(null);
              }
            }}
          />
        </View>
      </View>

      <Text style={styles.pageTitle}>{selectedSpaceName}</Text>
      <View style={styles.contentContainer}>
        {currentAssets.length > 0 ? (
          currentAssets.map((asset) => (
            <AssetAccordion
              key={asset.id}
              asset={asset}
              isExpanded={expandedAssetId === asset.id}
              onToggle={() => setExpandedAssetId(prev => prev === asset.id ? null : asset.id)}
              onAddHistory={openAddHistoryModal}
              isEditable={editableAssetIds.has(asset.id)}
            />
          ))
        ) : (
          <View style={styles.centerContainer}><Text style={styles.emptyText}>No assets found in this space.</Text></View>
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
            <TouchableOpacity onPress={() => removeSpecRow(spec.id)} style={styles.removeRowButton}>
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
        onCancel={() => setConfirmVisible(false)}
        onConfirm={async () => {
          setConfirmVisible(false);
          await confirmRef.current();
        }}
      />
    </SafeAreaView>
  );
};

