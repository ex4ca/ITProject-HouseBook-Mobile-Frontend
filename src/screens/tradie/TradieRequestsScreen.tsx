import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
  ActivityIndicator,
  Alert,
  LayoutAnimation,
  TextInput,
  ScrollView,
  Modal,
} from "react-native";
import { useFocusEffect, useRoute, useNavigation } from "@react-navigation/native";
import {
  CheckCircle,
  XCircle,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Plus,
  Calendar,
} from "lucide-react-native";
import {
  fetchTradieRequests,
  createTradieRequest,
  cancelTradieRequest,
} from "../../services/Request";
import { fetchPropertyAndJobScope } from "../../services/FetchAuthority";
import { propertyRequestsStyles as styles } from "../../styles/requestStyles";
import { PALETTE } from "../../styles/palette";
import type { PendingRequest } from "../../types";

// Reuse the existing SpecificationDetails component
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

// Reuse the existing RequestCard component but with cancel button instead of accept/decline
const RequestCard = ({
  item,
  onCancel,
  showActions = true,
}: {
  item: PendingRequest;
  onCancel?: (id: string) => void;
  showActions?: boolean;
}) => {
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
            <Text style={styles.propertyName}>
              {item.Assets.Spaces.name}
            </Text>
            <Text style={styles.assetName}>
              {item.Assets.description}
            </Text>
          </View>
          {isExpanded ? (
            <ChevronDown size={20} color={PALETTE.textSecondary} />
          ) : (
            <ChevronRight size={20} color={PALETTE.textSecondary} />
          )}
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
            <Text style={[styles.statusButtonText, { color: PALETTE.danger }]}>
              Cancel
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

// Request creation form component
const RequestCreationForm = ({
  spaces,
  onSubmit,
  onCancel,
}: {
  spaces: any[];
  onSubmit: (data: { spaceId: string; description: string; date: string }) => void;
  onCancel: () => void;
}) => {
  const [selectedSpaceId, setSelectedSpaceId] = useState<string>("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [showDropdown, setShowDropdown] = useState(false);

  const handleSubmit = () => {
    if (!selectedSpaceId || !description.trim()) {
      Alert.alert("Missing Information", "Please select a space and provide a description.");
      return;
    }
    onSubmit({ spaceId: selectedSpaceId, description: description.trim(), date });
  };

  return (
    <View style={styles.requestForm}>
      <Text style={styles.formTitle}>Create New Request</Text>
      
      <View style={showDropdown ? styles.formFieldActive : styles.formField}>
        <Text style={styles.fieldLabel}>Area/Room</Text>
        <TouchableOpacity
          style={styles.dropdownField}
          onPress={() => setShowDropdown(!showDropdown)}
        >
          <Text style={[
            styles.dropdownText,
            !selectedSpaceId && styles.dropdownPlaceholder
          ]}>
            {selectedSpaceId 
              ? spaces.find(s => s.id === selectedSpaceId)?.name 
              : "Select a space..."
            }
          </Text>
          <ChevronDown size={20} color={PALETTE.textSecondary} />
        </TouchableOpacity>
        
        {showDropdown && (
          <View style={styles.dropdownList}>
            {spaces.map((space) => (
              <TouchableOpacity
                key={space.id}
                style={styles.dropdownItem}
                onPress={() => {
                  setSelectedSpaceId(space.id);
                  setShowDropdown(false);
                }}
              >
                <Text style={styles.dropdownItemText}>{space.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      <View style={styles.formField}>
        <Text style={styles.fieldLabel}>Description</Text>
        <TextInput
          style={[styles.formInput, { height: 80, textAlignVertical: 'top' }]}
          placeholder="Describe the work completed..."
          value={description}
          onChangeText={setDescription}
          multiline
        />
      </View>

      <View style={styles.formField}>
        <Text style={styles.fieldLabel}>Date</Text>
        <View style={styles.dateInput}>
          <Calendar size={20} color={PALETTE.textSecondary} />
          <TextInput
            style={styles.formInput}
            value={date}
            onChangeText={setDate}
            placeholder="YYYY-MM-DD"
          />
        </View>
      </View>

      <View style={styles.formActions}>
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>Submit for Approval</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default function TradieRequestsScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { propertyId, jobId } = route.params as { propertyId: string; jobId: string };

  const [loading, setLoading] = useState(true);
  const [pendingRequests, setPendingRequests] = useState<PendingRequest[]>([]);
  const [acceptedRequests, setAcceptedRequests] = useState<PendingRequest[]>([]);
  const [propertyData, setPropertyData] = useState<any>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const loadData = useCallback(async () => {
    if (!propertyId || !jobId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      // Get current user ID
      const { data: { user } } = await import('../../config/supabaseClient').then(m => m.supabase.auth.getUser());
      if (!user) throw new Error("User not logged in");

      // Load property data and tradie requests in parallel
      const [propertyResult, requestsResult] = await Promise.all([
        fetchPropertyAndJobScope(propertyId, jobId),
        fetchTradieRequests(propertyId, user.id)
      ]);

      setPropertyData(propertyResult.property);
      setPendingRequests(requestsResult.pending);
      setAcceptedRequests(requestsResult.accepted);
    } catch (error: any) {
      console.error("Error loading data:", error.message);
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

  const handleCreateRequest = async (formData: { spaceId: string; description: string; date: string }) => {
    if (!propertyData) return;

    setSubmitting(true);
    try {
      // Find the first asset in the selected space
      const selectedSpace = propertyData.Spaces.find((space: any) => space.id === formData.spaceId);
      if (!selectedSpace || !selectedSpace.Assets || selectedSpace.Assets.length === 0) {
        Alert.alert("Error", "No assets found in the selected space");
        return;
      }

      const assetId = selectedSpace.Assets[0].id;
      await createTradieRequest(assetId, formData.description, { date: formData.date });
      
      setShowCreateForm(false);
      await loadData(); // Reload data to show the new request
      Alert.alert("Success", "Request submitted for approval");
    } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelRequest = async (id: string) => {
    try {
      await cancelTradieRequest(id);
      await loadData(); // Reload data to remove the cancelled request
      Alert.alert("Success", "Request cancelled");
    } catch (error: any) {
      Alert.alert("Error", error.message);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <ActivityIndicator size="large" color={PALETTE.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header Section */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <ChevronLeft size={24} color={PALETTE.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>All Requests</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.listContent}>
        {/* Request Creation Section */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.createButton}
            onPress={() => setShowCreateForm(!showCreateForm)}
            disabled={submitting}
          >
            {!showCreateForm && <Plus size={20} color={PALETTE.card} />}
            <Text style={styles.createButtonText}>
              {showCreateForm ? "Cancel" : "Create Request"}
            </Text>
          </TouchableOpacity>

          {showCreateForm && propertyData && (
            <RequestCreationForm
              spaces={propertyData.Spaces || []}
              onSubmit={handleCreateRequest}
              onCancel={() => setShowCreateForm(false)}
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
