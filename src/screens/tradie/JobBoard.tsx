import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Image,
  ActivityIndicator,
} from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import Button from "../../components/Button";
import { propertyListStyles as styles } from "../../styles/propertyListStyles";
import { PALETTE } from "../../styles/palette";
import { getJobsForTradie } from "../../services/FetchAuthority";
import { supabase } from "../../config/supabaseClient";

/**
 * A screen component that serves as the main "Job Board" for a tradie user.
 *
 * This screen displays:
 * 1.  A welcome header and a "Total Jobs" summary.
 * 2.  A button to navigate to the `QRScannerScreen` to add new jobs.
 * 3.  A list of all jobs currently assigned to the authenticated tradie.
 *
 * It fetches the job list every time the screen comes into focus.
 */
export default function JobBoard() {
  const navigation: any = useNavigation();
  const [loading, setLoading] = useState<boolean>(true);
  const [jobs, setJobs] = useState<any[]>([]);

  /**
   * A memoized function to fetch the jobs assigned to the current tradie.
   * It gets the authenticated user's ID and calls the `getJobsForTradie` service.
   */  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setJobs([]);
        return;
      }
      const data = await getJobsForTradie(user.id);
      setJobs(data || []);
    } catch (err) {
      console.error("Error fetching tradie jobs:", err);
      setJobs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchJobs();
    }, [fetchJobs]),
  );

  /**
   * Renders a single job card item in the FlatList.
   */
  const renderJobCard = ({ item }: { item: any }) => {
    const imageUrl = item.splash_image
      ? item.splash_image
      : `https://placehold.co/600x400/E5E7EB/111827?text=${encodeURIComponent(
          item.name || "Job",
        )}`;

    return (
      <TouchableOpacity
        style={styles.propertyCard}
        onPress={() =>
          navigation.navigate("TradiePropertyHub", {
            propertyId: item.property_id,
            jobId: item.job_id,
          })
        }
      >
        <Image source={{ uri: imageUrl }} style={styles.propertyImage} />
        <View style={styles.propertyInfo}>
          <View style={styles.propertyHeader}>
            <Text style={styles.propertyName} numberOfLines={1}>
              {item.name}
            </Text>
          </View>

          <Text style={styles.propertyAddress} numberOfLines={2}>
            📍 {item.address}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  /**
   * A component rendered at the top of the FlatList.
   * Contains the welcome message, summary card, and "Scan" button.
   */
  const ListHeader = () => (
    <>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Welcome, Tradesperson</Text>
        <Text style={styles.headerSubtitle}>Manage your assigned jobs.</Text>
      </View>
      <View style={styles.overviewCard}>
        <View
          style={{
            width: 24,
            height: 24,
            borderRadius: 6,
            backgroundColor: PALETTE.primary,
          }}
        />
        <View style={styles.overviewTextContainer}>
          <Text style={styles.overviewLabel}>Total Jobs</Text>
          <Text style={styles.overviewValue}>{jobs.length}</Text>
        </View>
      </View>
      <View style={{ marginVertical: 12 }}>
        <Button
          text="Scan to Add New Job"
          onPress={() => navigation.navigate("QRScannerScreen")}
        />
      </View>
      <Text style={styles.listTitle}>My Jobs</Text>
    </>
  );

  if (loading && jobs.length === 0) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <ActivityIndicator size="large" color={PALETTE.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={jobs}
        renderItem={renderJobCard}
        keyExtractor={(item) => item.job_id}
        ListHeaderComponent={ListHeader}
        contentContainerStyle={styles.listContentContainer}
        ListEmptyComponent={
          <View style={styles.centerContainer}>
            <Text style={styles.emptyListText}>You have no assigned jobs.</Text>
            <Text style={styles.emptyListText}>
              Scan a QR code to claim one.
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}