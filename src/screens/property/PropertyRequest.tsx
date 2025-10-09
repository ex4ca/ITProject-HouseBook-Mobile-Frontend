import React, { useState, useCallback, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
  LayoutAnimation,
  Image,
  ScrollView,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { SafeAreaView } from 'react-native-safe-area-context'; 
import {
  CheckCircle,
  XCircle,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
} from "lucide-react-native";
import {
  fetchPendingRequests,
  updateRequestStatus,
} from "../../services/Request";
import { propertyRequestsStyles as styles } from "../../styles/requestStyles";
import { PALETTE } from "../../styles/palette";
import type { PendingRequest } from "../../types";
import ConfirmModal from "../../components/ConfirmModal";

// Renders the specification details for a change request.
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

// Renders a single pending request card.
const RequestCard = ({
  item,
  onUpdateStatus,
}: {
  item: PendingRequest;
  onUpdateStatus: (id: string, status: "ACCEPTED" | "DECLINED") => void;
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpand = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsExpanded(!isExpanded);
  };

  // Safely displays the user's name or defaults to "System".
  const submittedByText = item.User
    ? `${item.User.first_name} ${item.User.last_name}`
    : "System";

  return (
    <View style={styles.card}>
      <TouchableOpacity onPress={toggleExpand}>
        <View style={styles.cardHeader}>
          <View style={styles.cardHeaderText}>
            {/* UPDATED: Display space and asset on separate lines with different styles */}
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
        <Text style={styles.descriptionText}>“{item.change_description}”</Text>
        <Text style={styles.submittedBy}>Submitted by: {submittedByText}</Text>
      </TouchableOpacity>

      {isExpanded && (
        <View style={styles.expandedContent}>
          <Text style={styles.detailsTitle}>Requested Specifications</Text>
          <SpecificationDetails specifications={item.specifications} />
        </View>
      )}

      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.statusButton, styles.declineButton]}
          onPress={() => onUpdateStatus(item.id, "DECLINED")}
        >
          <XCircle size={18} color={PALETTE.danger} />
          <Text style={[styles.statusButtonText, { color: PALETTE.danger }]}>
            Decline
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.statusButton, styles.acceptButton]}
          onPress={() => onUpdateStatus(item.id, "ACCEPTED")}
        >
          <CheckCircle size={18} color={PALETTE.success} />
          <Text style={[styles.statusButtonText, { color: PALETTE.success }]}>
            Accept
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// --- MAIN SCREEN COMPONENT (No changes) ---

const PropertyRequestsScreen = ({
  route,
  navigation,
}: {
  route: any;
  navigation: any;
}) => {
  const { propertyId } = route.params || {};
  const [simulating, setSimulating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<PendingRequest[]>([]);

  // If no propertyId is provided, show the Add Property (QR scan) UI
  if (!propertyId) {
    const handleSimulateScan = () => {
      // Open the PIN entry page with a hard-coded scanned property text
      navigation.navigate('PropertyPin', { scannedText: 'Property: 456 Collins Street, Melbourne' });
    };

    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <ChevronLeft size={24} color={PALETTE.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Add Property</Text>
          <View style={{ width: 40 }} />
        </View>
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.scanCard}>
            <Text style={styles.scanTitle}>Scan QR Code</Text>
            <View style={styles.dottedBox}>
              <Image
                source={{ uri: 'https://placehold.co/240x240/EFEFF4/111827?text=QR' }}
                style={styles.qrImage}
              />
              <Text style={{ marginTop: 12, color: PALETTE.textSecondary }}>
                Point camera at QR code
              </Text>
            </View>
            <Text style={[styles.emptyText, { marginTop: 12, textAlign: 'center' }]}> 
              Scan the QR code provided by the property owner to access the property details.
            </Text>

            <TouchableOpacity
              style={styles.simulateButton}
              onPress={handleSimulateScan}
            >
              <Text style={styles.simulateButtonText}>Simulate QR Scan</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  useFocusEffect(
    useCallback(() => {
      const loadRequests = async () => {
        if (!propertyId) {
          setLoading(false);
          return;
        }
        setLoading(true);
        try {
          const data = await fetchPendingRequests(propertyId);
          setRequests(data);
        } catch (err: any) {
          console.error(err.message);
          setRequests([]);
        } finally {
          setLoading(false);
        }
      };

      loadRequests();
    }, [propertyId])
  );

  // Use a confirmation modal before updating status
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [confirmTitle, setConfirmTitle] = useState('');
  const [confirmMessage, setConfirmMessage] = useState('');
  const [confirmDestructive, setConfirmDestructive] = useState(false);
  const pendingRequestRef = useRef<{ id: string; status: 'ACCEPTED' | 'DECLINED' } | null>(null);

  const askUpdateStatus = (id: string, status: 'ACCEPTED' | 'DECLINED') => {
    setConfirmTitle(status === 'ACCEPTED' ? 'Accept Request' : 'Decline Request');
    setConfirmMessage(`Are you sure you want to ${status === 'ACCEPTED' ? 'accept' : 'decline'} this request?`);
    setConfirmDestructive(status === 'DECLINED');
    pendingRequestRef.current = { id, status };
    setConfirmVisible(true);
  };

  const handleConfirmUpdate = async () => {
    const pending = pendingRequestRef.current;
    if (!pending) return;
    try {
      await updateRequestStatus(pending.id, pending.status);
      setRequests((prevRequests) => prevRequests.filter((req) => req.id !== pending.id));
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      pendingRequestRef.current = null;
      setConfirmVisible(false);
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
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <ChevronLeft size={24} color={PALETTE.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Pending Requests</Text>
        <View style={{ width: 40 }} />
      </View>
      <FlatList
        data={requests}
        renderItem={({ item }) => (
          <RequestCard item={item} onUpdateStatus={askUpdateStatus} />
        )}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.centerContainer}>
            <Text style={styles.emptyText}>
              No pending requests for this property.
            </Text>
          </View>
        }
      />
      <ConfirmModal
        visible={confirmVisible}
        title={confirmTitle}
        message={confirmMessage}
        destructive={confirmDestructive}
        onConfirm={handleConfirmUpdate}
        onCancel={() => setConfirmVisible(false)}
      />
    </SafeAreaView>
  );
};

export default PropertyRequestsScreen;