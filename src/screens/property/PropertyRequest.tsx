import React, { useState, useCallback } from "react";
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
  ArrowUpDown,
} from "lucide-react-native";
import {
  fetchPendingRequests,
  updateRequestStatus,
  fetchPropertyWorkHistory,
} from "../../services/Request";
import { propertyRequestsStyles as styles } from "../../styles/requestStyles";
import { PALETTE } from "../../styles/palette";
import type { PendingRequest } from "../../types";

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
  showActions = true,
}: {
  item: PendingRequest;
  onUpdateStatus?: (id: string, status: "ACCEPTED" | "DECLINED") => void;
  showActions?: boolean;
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
        <View style={styles.descriptionRow}>
          <Text style={styles.descriptionText}>"{item.change_description}"</Text>
          {(item.status === 'ACCEPTED' || item.status === 'DECLINED') && (
            <View style={[styles.statusLabel, item.status === 'ACCEPTED' ? styles.statusLabelAccepted : styles.statusLabelRejected]}>
              <Text style={[styles.statusLabelText, item.status === 'ACCEPTED' ? styles.statusLabelTextAccepted : styles.statusLabelTextRejected]}>
                {item.status === 'ACCEPTED' ? 'Accepted' : 'Rejected'}
              </Text>
            </View>
          )}
        </View>
        <Text style={styles.submittedBy}>Submitted by: {submittedByText}</Text>
        <Text style={styles.submittedDate}>{new Date(item.created_at).toLocaleDateString()}</Text>
      </TouchableOpacity>

      {isExpanded && (
        <View style={styles.expandedContent}>
          <Text style={styles.detailsTitle}>Requested Specifications</Text>
          <SpecificationDetails specifications={item.specifications} />
        </View>
      )}

      {showActions && onUpdateStatus && (
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
      )}
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
  const [workHistory, setWorkHistory] = useState<PendingRequest[]>([]);
  const [workHistorySortAscending, setWorkHistorySortAscending] = useState(false);

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
          const [pendingData, historyData] = await Promise.all([
            fetchPendingRequests(propertyId),
            fetchPropertyWorkHistory(propertyId)
          ]);
          setRequests(pendingData);
          setWorkHistory(historyData);
        } catch (err: any) {
          console.error(err.message);
          setRequests([]);
          setWorkHistory([]);
        } finally {
          setLoading(false);
        }
      };

      loadRequests();
    }, [propertyId])
  );

  const handleUpdateStatus = async (
    id: string,
    status: "ACCEPTED" | "DECLINED"
  ) => {
    // Confirm with native alert before changing status
    const title = status === 'ACCEPTED' ? 'Accept Request' : 'Decline Request';
    const message = status === 'ACCEPTED' ? 'Are you sure you want to accept this request?' : 'Are you sure you want to decline this request?';
    Alert.alert(
      title,
      message,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: status === 'ACCEPTED' ? 'Accept' : 'Decline',
          style: status === 'DECLINED' ? 'destructive' : 'default',
          onPress: async () => {
            try {
              await updateRequestStatus(id, status);
              // Refresh both lists to update pending requests and work history
              const [pendingData, historyData] = await Promise.all([
                fetchPendingRequests(propertyId),
                fetchPropertyWorkHistory(propertyId)
              ]);
              setRequests(pendingData);
              setWorkHistory(historyData);
            } catch (error: any) {
              Alert.alert('Error', error.message);
            }
          },
        },
      ],
      { cancelable: true }
    );
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
        <Text style={styles.headerTitle}>Requests</Text>
        <View style={{ width: 40 }} />
      </View>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.listContent}>
        {/* Pending Requests Section */}
        {requests.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Pending Requests ({requests.length})</Text>
            </View>
            {requests.map((request) => (
              <RequestCard
                key={request.id}
                item={request}
                onUpdateStatus={handleUpdateStatus}
                showActions={true}
              />
            ))}
          </View>
        )}

        {/* Work History Section */}
        {workHistory.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Work History ({workHistory.length})</Text>
              <TouchableOpacity 
                style={styles.sortToggle}
                onPress={() => setWorkHistorySortAscending(!workHistorySortAscending)}
              >
                <ArrowUpDown size={16} color={PALETTE.textSecondary} />
                <Text style={styles.sortToggleText}>
                  {workHistorySortAscending ? 'Oldest' : 'Newest'}
                </Text>
              </TouchableOpacity>
            </View>
            {workHistory
              .sort((a, b) => {
                const timeA = new Date(a.created_at).getTime();
                const timeB = new Date(b.created_at).getTime();
                return workHistorySortAscending ? timeA - timeB : timeB - timeA;
              })
              .map((request) => (
                <RequestCard
                  key={request.id}
                  item={request}
                  showActions={false}
                />
              ))}
          </View>
        )}

        {/* Empty State */}
        {requests.length === 0 && workHistory.length === 0 && (
          <View style={styles.centerContainer}>
            <Text style={styles.emptyText}>
              No requests for this property.
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default PropertyRequestsScreen;