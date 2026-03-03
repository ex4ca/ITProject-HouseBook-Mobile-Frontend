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
import { SafeAreaView } from "react-native-safe-area-context";
import { ChevronLeft, Edit } from "lucide-react-native";

import {
  fetchAssetDetails,
  addHistoryEntry,
} from "../../services/AssetService";
import { componentDetailsStyles as styles } from "../../styles/componentDetailsStyles";
import { PALETTE } from "../../styles/palette";
import type { AssetDetails } from "../../types";
import { HistoryEntryCard, AddEntryModal } from "../../components";

/**
 * A screen component that displays the detailed timeline and information
 * for a specific asset (component).
 *
 * It fetches asset details, including its changelog, and allows users
 * to add new history entries.
 */
const ComponentDetails = ({
  route,
  navigation,
}: {
  route: any;
  navigation: any;
}) => {
  const { assetId } = route.params || {};

  const [loading, setLoading] = useState(true);
  const [assetDetails, setAssetDetails] = useState<AssetDetails | null>(null);
  const [isAddingEntry, setIsAddingEntry] = useState(false);

  /**
   * `useFocusEffect` runs the provided callback every time the screen
   * comes into focus.
   */
  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const loadDataAsync = async () => {
        if (!assetId) {
          if (isActive) setLoading(false);
          return;
        }
        if (isActive) setLoading(true);
        try {
          const data = await fetchAssetDetails(assetId);
          if (isActive) {
            setAssetDetails(data);
          }
        } catch (error: any) {
          if (isActive) {
            Alert.alert("Error", "Could not load asset details.");
            console.error(error.message);
          }
        } finally {
          if (isActive) {
            setLoading(false);
          }
        }
      };

      loadDataAsync();

      return () => {
        isActive = false;
      };
    }, [assetId]),
  );

  const handleAddEntry = async (description: string) => {
    if (!assetId) return;
    try {
      await addHistoryEntry(assetId, description, {});
      setIsAddingEntry(false);
      // Reload data by calling fetchAssetDetails again
      const data = await fetchAssetDetails(assetId);
      setAssetDetails(data);
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

  if (!assetDetails) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text>Back</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.centerContainer}>
          <Text>Asset not found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const { description, ChangeLog, Spaces } = assetDetails;
  const breadcrumb = `${Spaces.Property.name} / ${Spaces.name}`;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={{ flexDirection: "row", alignItems: "center" }}
          onPress={() => navigation.goBack()}
        >
          <ChevronLeft size={24} color={PALETTE.textPrimary} />
          <Text style={styles.backButtonText}>{breadcrumb}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>{description}</Text>

        {ChangeLog.sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
        ).map((entry) => (
          <HistoryEntryCard key={entry.id} entry={entry} />
        ))}
      </ScrollView>

      <TouchableOpacity
        style={styles.floatingAddButton}
        onPress={() => setIsAddingEntry(true)}
      >
        <Edit size={24} color={PALETTE.card} />
      </TouchableOpacity>

      <AddEntryModal
        visible={isAddingEntry}
        onClose={() => setIsAddingEntry(false)}
        onSubmit={handleAddEntry}
      />
    </SafeAreaView>
  );
};

export default ComponentDetails;