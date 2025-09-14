import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { ChevronLeft, Settings } from "lucide-react-native";

import {
  fetchMyProfile,
  fetchPropertyOwner,
  fetchPropertyTradies,
} from "../../services/FetchAuthority";
import type { UserProfile, Tradie } from "../../types";
import { authorityStyles as styles } from "../../styles/authorityStyles";
import { PALETTE } from "../../styles/palette";

const MyProfileCard = ({ profile }: { profile: UserProfile | null }) => {
  if (!profile) return null;
  const initials = profile.name
    .split(" ")
    .map((n) => n[0])
    .join("");
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

const AuthorityManagementCard = ({ tradies }: { tradies: Tradie[] }) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>Authority Management</Text>
    {tradies.length > 0 ? (
      tradies.map((tradie) => {
        const initials = tradie.name
          .split(" ")
          .map((n) => n[0])
          .join("");
        return (
          <View key={tradie.id} style={styles.userRow}>
            <View style={styles.userInfo}>
              <View style={styles.smallAvatar}>
                <Text>{initials}</Text>
              </View>
              <View style={styles.userDetails}>
                <Text style={styles.userRowName}>{tradie.name}</Text>
                <Text style={styles.userStatus}>
                  {tradie.status.replace("_", " ")}
                </Text>
              </View>
            </View>
            <TouchableOpacity style={styles.settingsButton}>
              <Settings size={20} color={PALETTE.textSecondary} />
            </TouchableOpacity>
          </View>
        );
      })
    ) : (
      <Text>No tradies have been added to this property yet.</Text>
    )}
  </View>
);

// --- MAIN SCREEN COMPONENT ---

const Role = ({ route, navigation }: { route: any; navigation: any }) => {
  const { propertyId, isOwner } = route.params || {};

  const [loading, setLoading] = useState(true);
  const [myProfile, setMyProfile] = useState<UserProfile | null>(null);
  const [propertyOwner, setPropertyOwner] = useState<UserProfile | null>(null);
  const [tradies, setTradies] = useState<Tradie[]>([]);

  useFocusEffect(
    useCallback(() => {
      const fetchData = async () => {
        setLoading(true);
        // Fetch all required data in parallel for performance.
        const [profile, owner, tradieList] = await Promise.all([
          fetchMyProfile(),
          isOwner ? Promise.resolve(null) : fetchPropertyOwner(propertyId),
          isOwner ? fetchPropertyTradies(propertyId) : Promise.resolve([]),
        ]);
        setMyProfile(profile);
        setPropertyOwner(owner);
        setTradies(tradieList);
        setLoading(false);
      };
      fetchData();
    }, [propertyId, isOwner])
  );

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

        {isOwner && <AuthorityManagementCard tradies={tradies} />}
      </ScrollView>
    </SafeAreaView>
  );
};

export default Role;