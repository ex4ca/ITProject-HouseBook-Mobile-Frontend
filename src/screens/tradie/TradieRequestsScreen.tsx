import React, { useState, useCallback, useEffect, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  LayoutAnimation,
  TextInput,
  ScrollView,
} from "react-native";
import { useFocusEffect, useRoute, useNavigation } from "@react-navigation/native";
import {
  XCircle,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Plus,
  PlusCircle,
  Trash2,
} from "lucide-react-native";
import {
  fetchTradieRequests,
  cancelTradieRequest,
} from "../../services/Request";
import { addHistoryTradie } from "../../services/propertyDetails";
import { SafeAreaView } from 'react-native-safe-area-context'; 
import { fetchPropertyAndJobScope } from "../../services/FetchAuthority";
import { propertyRequestsStyles as styles } from "../../styles/requestStyles";
import { PALETTE } from "../../styles/palette";
import { DropField } from "../../components";
import type { PendingRequest, SpaceWithAssets, AssetWithChangelog, EditableSpec } from "../../types";

// --- Reusable Components (Unchanged) ---
const SpecificationDetails = ({ specifications }: { specifications: Record<string, any> }) => (
    <View style={styles.specificationsBox}>
        {Object.entries(specifications).map(([key, value]) => (
            <View key={key} style={styles.specPair}>
                <Text style={styles.specKey}>{key}</Text>
                <Text style={styles.specValue}>{String(value)}</Text>
            </View>
        ))}
    </View>
);

const RequestCard = ({ item, onCancel, showActions = true }: { item: PendingRequest; onCancel?: (id: string) => void; showActions?: boolean; }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpand = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsExpanded(!isExpanded);
  };

  const submittedByText = item.User
    ? `${item.User.first_name} ${item.User.last_name}`
    : "System";

  return (
    <View style={styles.card}>
      <TouchableOpacity onPress={toggleExpand}>
        <View style={styles.cardHeader}>
          <View style={styles.cardHeaderText}>
            <Text style={styles.propertyName}>{item.Assets.Spaces.name}</Text>
            <Text style={styles.assetName}>{item.Assets.description}</Text>
          </View>
          {isExpanded ? <ChevronDown size={20} color={PALETTE.textSecondary} /> : <ChevronRight size={20} color={PALETTE.textSecondary} />}
        </View>
        <Text style={styles.descriptionText}>"{item.change_description}"</Text>
        <Text style={styles.submittedBy}>Submitted by: {submittedByText}</Text>
      </TouchableOpacity>

      {isExpanded && (
        <View style={styles.expandedContent}>
          <Text style={styles.detailsTitle}>Requested Specifications</Text>
          <SpecificationDetails specifications={item.specifications} />
        </View>
      )}

      {showActions && item.status === 'PENDING' && onCancel && (
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.statusButton, styles.declineButton]}
            onPress={() => onCancel(item.id)}
          >
            <XCircle size={18} color={PALETTE.danger} />
            <Text style={[styles.statusButtonText, { color: PALETTE.danger }]}>Cancel</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

// --- Updated Request Creation Form ---
const RequestCreationForm = ({
  spaces,
  editableAssetIds,
  onSubmit,
}: {
  spaces: SpaceWithAssets[];
  editableAssetIds: Set<string>;
  onSubmit: (data: { assetId: string; description: string; specifications: Record<string, string> }) => void;
}) => {
  const [selectedSpaceId, setSelectedSpaceId] = useState<string | null>(null);
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [editableSpecs, setEditableSpecs] = useState<EditableSpec[]>([]);

  const availableAssets = useMemo(() => {
    if (!selectedSpaceId) return [];
    return (spaces.find(s => s.id === selectedSpaceId)?.Assets || [])
      .filter(a => editableAssetIds.has(a.id));
  }, [selectedSpaceId, spaces, editableAssetIds]);

  const selectedAsset = useMemo(() => {
    return availableAssets.find(a => a.id === selectedAssetId) || null;
  }, [selectedAssetId, availableAssets]);

  // FIX: This useEffect hook now pre-populates the specification editor
  // whenever a new asset is selected from the dropdown.
  useEffect(() => {
    if (selectedAsset) {
      const latestAcceptedLog = selectedAsset.ChangeLog?.find(log => log.status === 'ACCEPTED');
      const latestSpecs = latestAcceptedLog?.specifications || {};
      const specsArray = Object.entries(latestSpecs).map(([key, value], index) => ({
        id: Date.now() + index, // More unique key
        key: key,
        value: value as string,
      }));
      setEditableSpecs(specsArray.length > 0 ? specsArray : [{ id: Date.now(), key: '', value: '' }]);
    } else {
      setEditableSpecs([{ id: Date.now(), key: '', value: '' }]); // Reset if no asset is selected
    }
  }, [selectedAsset]);

  const handleSpecChange = (id: number, field: "key" | "value", value: string) => {
    setEditableSpecs(prev => prev.map(spec => (spec.id === id ? { ...spec, [field]: value } : spec)));
  };
  const addNewSpecRow = () => setEditableSpecs(prev => [...prev, { id: Date.now(), key: "", value: "" }]);
  const removeSpecRow = (id: number) => setEditableSpecs(prev => prev.filter(spec => spec.id !== id));

  const handleSubmit = () => {
    if (!selectedAssetId || !description.trim()) {
        Alert.alert("Missing Information", "Please select a space, an asset, and provide a description.");
        return;
    }
    const specifications = editableSpecs.reduce((acc, spec) => {
      if (spec.key.trim()) acc[spec.key.trim()] = spec.value.trim();
      return acc;
    }, {} as Record<string, string>);

    onSubmit({ assetId: selectedAssetId, description, specifications });
  };

  return (
    <View style={styles.requestForm}>
      <Text style={styles.formTitle}>Create New Request</Text>
      
      <Text style={styles.fieldLabel}>Space</Text>
      <DropField
        options={spaces.map(s => s.name)}
        selectedValue={spaces.find(s => s.id === selectedSpaceId)?.name}
        onSelect={(name) => {
          const space = spaces.find(s => s.name === name);
          setSelectedSpaceId(space ? space.id : null);
          setSelectedAssetId(null);
        }}
        placeholder="Select a space..."
      />

      {selectedSpaceId && (
        <>
            <Text style={[styles.fieldLabel, { marginTop: 12 }]}>Asset</Text>
            <DropField
                options={availableAssets.map(a => a.description)}
                selectedValue={selectedAsset?.description}
                onSelect={(desc) => {
                    const asset = availableAssets.find(a => a.description === desc);
                    setSelectedAssetId(asset ? asset.id : null);
                }}
                placeholder={availableAssets.length > 0 ? "Select an asset to update..." : "No editable assets in this space"}
                disabled={availableAssets.length === 0}
            />
        </>
      )}

      {selectedAssetId && (
        <>
            <Text style={[styles.fieldLabel, { marginTop: 12 }]}>Description of Change</Text>
            <TextInput
                style={[styles.formInput, { height: 80, textAlignVertical: 'top' }]}
                placeholder="Describe the work completed or the change made..."
                value={description}
                onChangeText={setDescription}
                multiline
            />

            <Text style={[styles.fieldLabel, { marginTop: 12 }]}>New Specifications</Text>
            {editableSpecs.map((spec) => (
              <View key={spec.id} style={styles.specRow}>
                <TextInput style={[styles.input, styles.specInputKey]} placeholder="Attribute" value={spec.key} onChangeText={(text) => handleSpecChange(spec.id, "key", text)} />
                <TextInput style={[styles.input, styles.specInputValue]} placeholder="Value" value={spec.value} onChangeText={(text) => handleSpecChange(spec.id, "value", text)} />
                <TouchableOpacity onPress={() => removeSpecRow(spec.id)} style={styles.removeRowButton}><Trash2 size={20} color={PALETTE.danger} /></TouchableOpacity>
              </View>
            ))}
            <TouchableOpacity style={styles.addRowButton} onPress={addNewSpecRow}>
                <PlusCircle size={20} color={PALETTE.primary} />
                <Text style={styles.addRowButtonText}>Add Attribute</Text>
            </TouchableOpacity>

            <View style={styles.formActions}>
                <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
                    <Text style={styles.submitButtonText}>Submit for Approval</Text>
                </TouchableOpacity>
            </View>
        </>
      )}
    </View>
  );
};

// --- Main Screen ---
export default function TradieRequestsScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { propertyId, jobId } = (route.params || {}) as { propertyId: string; jobId: string };

  const [loading, setLoading] = useState(true);
  const [pendingRequests, setPendingRequests] = useState<PendingRequest[]>([]);
  const [acceptedRequests, setAcceptedRequests] = useState<PendingRequest[]>([]);
  const [propertyData, setPropertyData] = useState<any>(null);
  const [editableAssetIds, setEditableAssetIds] = useState<Set<string>>(new Set());
  const [showCreateForm, setShowCreateForm] = useState(false);

  const loadData = useCallback(async () => {
    if (!propertyId || !jobId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await import('../../config/supabaseClient').then(m => m.supabase.auth.getUser());
      if (!user) throw new Error("User not logged in");

      const [propertyResult, requestsResult] = await Promise.all([
        fetchPropertyAndJobScope(propertyId, jobId),
        fetchTradieRequests(propertyId, user.id)
      ]);

      setPropertyData(propertyResult.property);
      setEditableAssetIds(propertyResult.editableAssetIds || new Set());
      setPendingRequests(requestsResult.pending);
      setAcceptedRequests(requestsResult.accepted);
    } catch (error: any) {
      Alert.alert("Error", "Failed to load requests data");
    } finally {
      setLoading(false);
    }
  }, [propertyId, jobId]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const handleCreateRequest = async (formData: { assetId: string; description: string; specifications: Record<string, string> }) => {
    let assetToUpdate: AssetWithChangelog | null = null;
    for (const space of (propertyData?.Spaces || [])) {
        const foundAsset = space.Assets.find((a: AssetWithChangelog) => a.id === formData.assetId);
        if (foundAsset) {
            assetToUpdate = foundAsset;
            break;
        }
    }
    
    if (!assetToUpdate) {
        Alert.alert("Error", "Could not find the selected asset.");
        return;
    }

    try {
        await addHistoryTradie(assetToUpdate, formData.description, formData.specifications);
        setShowCreateForm(false);
        await loadData();
        Alert.alert("Success", "Your request has been submitted for approval.");
    } catch (error: any) {
        Alert.alert("Error", error.message);
    }
  };

  const handleCancelRequest = async (id: string) => {
    try {
      await cancelTradieRequest(id);
      await loadData();
      Alert.alert("Success", "Request cancelled");
    } catch (error: any) {
      Alert.alert("Error", error.message);
    }
  };

  if (loading) {
    return <SafeAreaView style={styles.centerContainer}><ActivityIndicator size="large" color={PALETTE.primary} /></SafeAreaView>;
  }

  const spacesWithEditableAssets = (propertyData?.Spaces || []).filter((space: SpaceWithAssets) =>
    space.Assets.some(asset => editableAssetIds.has(asset.id))
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header Section */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}><ChevronLeft size={24} color={PALETTE.textPrimary} /></TouchableOpacity>
        <Text style={styles.headerTitle}>All Requests</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.listContent}>
        {/* Request Creation Section */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.createButton}
            onPress={() => setShowCreateForm(!showCreateForm)}
          >
            {!showCreateForm && <Plus size={20} color={PALETTE.card} />}
            <Text style={styles.createButtonText}>{showCreateForm ? "Cancel" : "Create Request"}</Text>
          </TouchableOpacity>

           {showCreateForm && (
             <RequestCreationForm
               spaces={spacesWithEditableAssets}
               editableAssetIds={editableAssetIds}
               onSubmit={handleCreateRequest}
             />
           )}
        </View>

        {/* Pending Requests Section */}
        {pendingRequests.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Awaiting Approval ({pendingRequests.length})</Text>
            {pendingRequests.map((request) => (
              <RequestCard
                key={request.id}
                item={request}
                onCancel={handleCancelRequest}
                showActions={true}
              />
            ))}
          </View>
        )}

        {/* Work History Section */}
        {acceptedRequests.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Work History ({acceptedRequests.length})</Text>
            {acceptedRequests.map((request) => (
              <RequestCard
                key={request.id}
                item={request}
                showActions={false}
              />
            ))}
          </View>
        )}

        {/* Empty State */}
        {pendingRequests.length === 0 && acceptedRequests.length === 0 && !showCreateForm && (
          <View style={styles.centerContainer}>
            <Text style={styles.emptyText}>
              No requests found. Create your first request to get started.
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}