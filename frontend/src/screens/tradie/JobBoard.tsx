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
import { SafeAreaView } from 'react-native-safe-area-context'; 
import Button from "../../components/Button";
import { propertyListStyles as styles } from "../../styles/propertyListStyles";
import { PALETTE } from "../../styles/palette";
import { getJobsForTradie } from "../../services/FetchAuthority";
import { supabase } from "../../config/supabaseClient";

export default function JobBoard() {
  const navigation: any = useNavigation();
  const [loading, setLoading] = useState<boolean>(true);
  const [jobs, setJobs] = useState<any[]>([]);

  // Fetches jobs assigned to the current tradie from the 'Jobs' table.
  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
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

  // Refreshes the job list when the screen is focused.
  useFocusEffect(
    useCallback(() => {
      fetchJobs();
    }, [fetchJobs])
  );

  const renderJobCard = ({ item }: { item: any }) => {
    const imageUrl = `https://placehold.co/600x400/E5E7EB/111827?text=${encodeURIComponent(
      item.name || "Job"
    )}`;

    return (
      <TouchableOpacity
        style={styles.propertyCard}
        // This now navigates to the correct hub and passes both required IDs.
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
          
          {/* Activity Status */}
          <Text style={styles.propertyAddress} numberOfLines={1}>
            {item.isActive ? 'Active' : 'Inactive'}
          </Text>
          
          <Text style={styles.propertyAddress} numberOfLines={2}>
            📍 {item.address}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const ListHeader = () => (
    <>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Welcome, Tradesperson</Text>
        <Text style={styles.headerSubtitle}>Manage your assigned jobs.</Text>
      </View>
      <View style={styles.overviewCard}>
        <View style={{ width: 24, height: 24, borderRadius: 6, backgroundColor: PALETTE.primary }} />
        <View style={styles.overviewTextContainer}>
          <Text style={styles.overviewLabel}>Total Jobs</Text>
          <Text style={styles.overviewValue}>{jobs.length}</Text>
        </View>
      </View>
      <View style={{ marginVertical: 12 }}>
        <Button text="Scan to Add New Job" onPress={() => navigation.navigate("QRScannerScreen")} />
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
                <Text style={styles.emptyListText}>Scan a QR code to claim one.</Text>
            </View>
        }
      />
    </SafeAreaView>
  );
}