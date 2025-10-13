import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { ChevronLeft, XCircle } from "lucide-react-native";
import { SafeAreaView } from 'react-native-safe-area-context'; 

import {
  fetchMyProfile,
  fetchPropertyOwner,
  fetchActiveJobsForProperty,
  endTradieJob,
} from "../../services/FetchAuthority";
import type { UserProfile, ActiveTradieJob } from "../../types";
import { authorityStyles as styles } from "../../styles/authorityStyles";
import { PALETTE } from "../../styles/palette";

const MyProfileCard = ({ profile }: { profile: UserProfile | null }) => {
  if (!profile) return null;
  const initials = profile.name.split(" ").map((n) => n[0]).join("");
  return (
    <View style={[styles.section, styles.userProfile]}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{initials}</Text>
      </View>
      <Text style={styles.userName}>{profile.name}</Text>
      <Text style={styles.userEmail}>{profile.email}</Text>
    </View>
  );
};

const PropertyOwnerCard = ({ owner }: { owner: UserProfile | null }) => {
  if (!owner) return null;
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Property Owner</Text>
      <Text style={styles.ownerInfoLine}>{owner.name}</Text>
      <Text style={styles.ownerInfoLine}>{owner.email}</Text>
      <Text style={styles.ownerInfoLine}>
        {owner.phone || "No phone number provided"}
      </Text>
    </View>
  );
};

const AuthorityManagementCard = ({ 
  jobs,
  onEndSession 
}: { 
  jobs: ActiveTradieJob[],
  // FIX: Update the function signature to include tradieId
  onEndSession: (jobId: string, tradieId: string, tradieName: string) => void,
}) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>Active on Property</Text>
    {jobs.length > 0 ? (
      jobs.map((job) => {
        const initials = job.tradieName.split(" ").map((n) => n[0]).join("");
        return (
          <View key={`${job.jobId}-${job.tradieId}`} style={styles.userRow}>
            <View style={styles.userInfo}>
              <View style={styles.smallAvatar}>
                <Text>{initials}</Text>
              </View>
              <View style={styles.userDetails}>
                <Text style={styles.userRowName}>{job.tradieName}</Text>
                <Text style={styles.userStatus}>Job: {job.jobTitle}</Text>
              </View>
            </View>
            <TouchableOpacity 
              style={[styles.statusButton, styles.endSessionButton]}
              onPress={() => onEndSession(job.jobId, job.tradieId, job.tradieName)}
            >
              <XCircle size={18} color={PALETTE.danger} />
              <Text style={styles.endSessionButtonText}>End Session</Text>
            </TouchableOpacity>
          </View>
        );
      })
    ) : (
      <Text style={styles.emptyText}>
        No tradies are currently active on this property.
      </Text>
    )}
  </View>
);

const Role = ({ route, navigation }: { route: any; navigation: any }) => {
  const { propertyId, isOwner } = route.params || {};

  const [loading, setLoading] = useState(true);
  const [myProfile, setMyProfile] = useState<UserProfile | null>(null);
  const [propertyOwner, setPropertyOwner] = useState<UserProfile | null>(null);
  const [activeJobs, setActiveJobs] = useState<ActiveTradieJob[]>([]);

  useFocusEffect(
    useCallback(() => {
      const fetchData = async () => {
        setLoading(true);
        try {
          if (!propertyId) {
             setActiveJobs([]);
             setPropertyOwner(null);
             const profile = await fetchMyProfile();
             setMyProfile(profile);
             return;
          }

          const [profile, owner, jobList] = await Promise.all([
            fetchMyProfile(),
            isOwner ? Promise.resolve(null) : fetchPropertyOwner(propertyId),
            isOwner ? fetchActiveJobsForProperty(propertyId) : Promise.resolve([]),
          ]);
          setMyProfile(profile);
          setPropertyOwner(owner);
          setActiveJobs(jobList || []); 
        } catch (error) {
          console.error("Failed to fetch authority data:", error);
          Alert.alert("Error", "Could not load the authority data.");
        } finally {
          setLoading(false);
        }
      };

      fetchData();
    }, [propertyId, isOwner])
  );

  // FIX: Update the function to accept tradieId
  const handleEndSession = async (jobId: string, tradieId: string, tradieName: string) => {
    Alert.alert(
      "End Session",
      `Are you sure you want to end the session for ${tradieName}? This action cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "End Session", 
          style: "destructive",
          onPress: async () => {
            try {
              await endTradieJob(jobId, tradieId);
              setActiveJobs((prevJobs) => prevJobs.filter(
                (job) => !(job.jobId === jobId && job.tradieId === tradieId)
              ));
            } catch (error) {
              Alert.alert("Error", "Could not end the session. Please try again.");
            }
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <ChevronLeft size={24} color={PALETTE.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Authority</Text>
          <View style={{ width: 40 }} />
        </View>
        <ActivityIndicator
          style={{ flex: 1 }}
          size="large"
          color={PALETTE.primary}
        />
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
        <Text style={styles.headerTitle}>Authority</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <MyProfileCard profile={myProfile} />
        {!isOwner && <PropertyOwnerCard owner={propertyOwner} />}
        {isOwner && (
          <AuthorityManagementCard 
            jobs={activeJobs}
            onEndSession={handleEndSession}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default Role;