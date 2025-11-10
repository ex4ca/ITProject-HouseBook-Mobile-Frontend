import React, { useState, useCallback, useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Image,
  ActivityIndicator,
} from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { Home } from "lucide-react-native";
import { supabase } from "../../config/supabaseClient";
import {
  getPropertiesByOwner,
  fetchMyFirstName,
} from "../../services/FetchAuthority";
import { SafeAreaView } from "react-native-safe-area-context";
import { propertyListStyles as styles } from "../../styles/propertyListStyles";
import { PALETTE } from "../../styles/palette";
import type { Property } from "../../types";

/**
 * A screen component that displays a list of properties for an "Owner" user.
 *
 * This screen shows a personalized welcome message, a summary card with the
 * total property count, and a list of all properties associated with the
 * authenticated user. It also subscribes to real-time database changes
 * to automatically refresh the list.
 */
const PropertyList = () => {
  const navigation: any = useNavigation();
  const [properties, setProperties] = useState<Property[]>([]);
  const [userName, setUserName] = useState<string | null>("");
  const [loading, setLoading] = useState(true);

  const isFetching = useRef(false);

  /**
   * A memoized function to fetch all necessary data for the screen.
   * It retrieves the current user, their first name, and their properties.
   */
  const fetchData = useCallback(async () => {
    if (isFetching.current) return;

    try {
      isFetching.current = true;
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setProperties([]);
        setUserName("");
        return;
      }

      // Fetch user's name and properties concurrently.
      const [fetchedProperties, firstName] = await Promise.all([
        getPropertiesByOwner(user.id),
        fetchMyFirstName(),
      ]);

      setUserName(firstName);
      setProperties(fetchedProperties || []);
    } catch (err: any) {
      console.error("Error fetching data: ", err.message);
      setProperties([]);
      setUserName("");
    } finally {
      isFetching.current = false;
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData]),
  );

  useEffect(() => {
    const channel = supabase
      .channel("public:Property")
      .on("postgres_changes", { event: "*", schema: "public" }, () => {
        fetchData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchData]);

  const renderPropertyCard = ({ item }: { item: Property }) => {
    // Use the splash_image from the database if it exists, otherwise use a placeholder.
    const imageUrl = item.splash_image
      ? item.splash_image
      : `https://placehold.co/600x400/E5E7EB/111827?text=${encodeURIComponent(
          item.name || "Property",
        )}`;

    const isInProgress =
      item.status && item.status.toLowerCase().includes("progress");

    return (
      <TouchableOpacity
        style={styles.propertyCard}
        onPress={() =>
          navigation.navigate("PropertyDetails", {
            propertyId: item.property_id,
            isOwner: true,
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
        </View>
      </TouchableOpacity>
    );
  };

  const ListHeader = () => (
    <>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Welcome, {userName || "Owner"}</Text>
        <Text style={styles.headerSubtitle}>
          Here is your property overview.
        </Text>
      </View>
      <View style={styles.overviewCard}>
        <Home size={24} color={PALETTE.primary} />
        <View style={styles.overviewTextContainer}>
          <Text style={styles.overviewLabel}>Total Properties</Text>
          <Text style={styles.overviewValue}>{properties.length}</Text>
        </View>
      </View>
      <Text style={styles.listTitle}>My Properties</Text>
    </>
  );

  if (loading && properties.length === 0) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <ActivityIndicator size="large" color={PALETTE.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={properties}
        renderItem={renderPropertyCard}
        keyExtractor={(item) => item.property_id}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.centerContainer}>
              <Text style={styles.emptyListText}>
                You haven't added any properties yet.
              </Text>
            </View>
          ) : null
        }
        contentContainerStyle={styles.listContentContainer}
      />
    </SafeAreaView>
  );
};

export default PropertyList;