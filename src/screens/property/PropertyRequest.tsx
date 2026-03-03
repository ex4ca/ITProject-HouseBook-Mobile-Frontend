import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
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
import { RequestCard } from "../../components";
import type { PendingRequest } from "../../types";

/**
 * A dual-purpose screen component.
 *
 * 1.  **"Add Property" Mode (No `propertyId`):**
 * If no `propertyId` is passed in the route parameters, the screen
 * displays a UI for adding a new property, prompting the user
 * to scan a QR code (or simulate a scan). This is likely for
 * a "tradie" user role.
 *
 * 2.  **"Requests" Mode (With `propertyId`):**
 * If a `propertyId` is provided, the screen fetches and displays
 * two lists for that property:
 * - A list of "Pending Requests" that an owner can accept or decline.
 * - A "Work History" list of all past accepted/declined requests.
 *
 * Data is refreshed every time the screen comes into focus.
 */
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
  const [workHistorySortAscending, setWorkHistorySortAscending] =
    useState(false);

  // If no propertyId is provided, show the Add Property (QR scan) UI
  if (!propertyId) {
    const handleSimulateScan = () => {
      // Open the PIN entry page with a hard-coded scanned property text
      navigation.navigate("PropertyPin", {
        scannedText: "Property: 456 Collins Street, Melbourne",
      });
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
                source={{
                  uri: "https://placehold.co/240x240/EFEFF4/111827?text=QR",
                }}
                style={styles.qrImage}
              />
              <Text style={{ marginTop: 12, color: PALETTE.textSecondary }}>
                Point camera at QR code
              </Text>
            </View>
            <Text
              style={[styles.emptyText, { marginTop: 12, textAlign: "center" }]}
            >
              Scan the QR code provided by the property owner to access the
              property details.
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
            fetchPropertyWorkHistory(propertyId),
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
    }, [propertyId]),
  );

  const handleUpdateStatus = async (
    id: string,
    status: "ACCEPTED" | "DECLINED",
  ) => {
    // Confirm with native alert before changing status
    const title = status === "ACCEPTED" ? "Accept Request" : "Decline Request";
    const message =
      status === "ACCEPTED"
        ? "Are you sure you want to accept this request?"
        : "Are you sure you want to decline this request?";
    Alert.alert(
      title,
      message,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: status === "ACCEPTED" ? "Accept" : "Decline",
          style: status === "DECLINED" ? "destructive" : "default",
          onPress: async () => {
            try {
              await updateRequestStatus(id, status);
              // Refresh both lists to update pending requests and work history
              const [pendingData, historyData] = await Promise.all([
                fetchPendingRequests(propertyId),
                fetchPropertyWorkHistory(propertyId),
              ]);
              setRequests(pendingData);
              setWorkHistory(historyData);
            } catch (error: any) {
              Alert.alert("Error", error.message);
            }
          },
        },
      ],
      { cancelable: true },
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
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.listContent}
      >
        {/* Pending Requests Section */}
        {requests.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                Pending Requests ({requests.length})
              </Text>
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
              <Text style={styles.sectionTitle}>
                Work History ({workHistory.length})
              </Text>
              <TouchableOpacity
                style={styles.sortToggle}
                onPress={() =>
                  setWorkHistorySortAscending(!workHistorySortAscending)
                }
              >
                <ArrowUpDown size={16} color={PALETTE.textSecondary} />
                <Text style={styles.sortToggleText}>
                  {workHistorySortAscending ? "Oldest" : "Newest"}
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
            <Text style={styles.emptyText}>No requests for this property.</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default PropertyRequestsScreen;