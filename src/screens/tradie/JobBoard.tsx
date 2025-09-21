import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
  Image,
  ActivityIndicator,
} from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import Button from "../../components/Button";
import { propertyListStyles as styles } from "../../styles/propertyListStyles";
import { PALETTE } from "../../styles/palette";
import { getJobsForTradie } from "../../services/FetchAuthority";
import { supabase } from "../../config/supabaseClient";

const sampleJobs = [
  {
    id: "1",
    name: "Oak Street Residence",
    address: "123 Oak Street, Melbourne VIC 3000",
    owner: "John Smith",
    status: "in progress",
  },
  {
    id: "2",
    name: "Collins Street Office",
    address: "456 Collins Street, Melbourne VIC 3000",
    owner: "Sarah Johnson",
    status: "completed",
  },
  {
    id: "3",
    name: "Beach Road Townhouse",
    address: "789 Beach Road, St Kilda VIC 3182",
    owner: "Mike Wilson",
    status: "scheduled",
  },
];

export default function JobBoard() {
  const navigation: any = useNavigation();
  const [loading, setLoading] = useState<boolean>(true);
  const [jobs, setJobs] = useState<any[]>([]);

  const fetchJobs = useCallback(async () => {
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
    }, [fetchJobs])
  );

  const renderJobCard = ({ item }: { item: any }) => {
    const imageUrl = `https://placehold.co/600x400/E5E7EB/111827?text=${encodeURIComponent(
      item.name || "Job"
    )}`;

    const isInProgress = item.status && item.status.toLowerCase().includes("progress");

    return (
      <TouchableOpacity
        style={styles.propertyCard}
        onPress={() =>
          navigation.navigate("PropertyDetails", {
            propertyId: item.id,
            isOwner: false,
          })
        }
      >
        <Image source={{ uri: imageUrl }} style={styles.propertyImage} />
        <View style={styles.propertyInfo}>
          <View style={styles.propertyHeader}>
            <Text style={styles.propertyName} numberOfLines={1}>
              {item.name}
            </Text>
            {isInProgress && (
              <View style={styles.statusBadge}>
                <Text style={styles.statusBadgeText}>In Progress</Text>
              </View>
            )}
          </View>

          <Text style={styles.propertyAddress} numberOfLines={2}>
            📍 {item.address}
          </Text>

          <Text style={styles.ownerText}>Owner: {item.owner}</Text>
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
          <Text style={styles.overviewValue}>{sampleJobs.length}</Text>
        </View>
      </View>

      {/* Add New Property button above the job list */}
      <View style={{ marginVertical: 12 }}>
        <Button text="Add New Property" onPress={() => navigation.navigate("PropertyRequest")} />
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
        keyExtractor={(item) => item.property_id || item.id}
        ListHeaderComponent={ListHeader}
        contentContainerStyle={styles.listContentContainer}
      />
    </SafeAreaView>
  );
}
