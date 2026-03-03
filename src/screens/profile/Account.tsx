import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useFocusEffect, useRoute, RouteProp } from "@react-navigation/native";
import { supabase } from "../../config/supabaseClient";
import { SafeAreaView } from "react-native-safe-area-context";
import { User, LogOut } from "lucide-react-native";
import { PALETTE } from "../../styles/palette";
import { styles } from "../../styles/accountStyles";
import { fetchUserProfile, UserProfile } from "../../services/AuthService";

/**
 * Defines the type for the navigation route parameters
 * expected by this screen.
 */
type AccountScreenRouteParams = {
  userRole?: "owner" | "tradie";
};

/**
 * A screen component that displays the current user's account information
 * and provides an option to sign out.
 *
 * It fetches the user's profile details from Supabase every time the
 * screen is focused.
 */
const AccountScreen = () => {
  const route =
    useRoute<RouteProp<{ params: AccountScreenRouteParams }, "params">>();
  const { userRole: selectedRole } = route.params || { userRole: "owner" };

  const [loading, setLoading] = useState<boolean>(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [userRole, setUserRole] = useState<string>("");

  /**
   * `useFocusEffect` runs the provided callback every time the screen
   * comes into focus, ensuring data is always fresh.
   */  
  useFocusEffect(
    useCallback(() => {
      const fetchData = async () => {
        setLoading(true);
        try {
          const {
            data: { user },
          } = await supabase.auth.getUser();
          if (!user) throw new Error("No user logged in.");

          // Fetch user profile from AuthService
          const profile = await fetchUserProfile(user.id);
          setUserProfile(profile);
          setUserRole(
            selectedRole === "owner" ? "Property Owner" : "Trade Person",
          );
        } catch (error: any) {
          console.error("Error fetching account data:", error.message);
          setUserProfile(null);
          setUserRole("");
        } finally {
          setLoading(false);
        }
      };

      fetchData();
    }, [selectedRole]),
  );

  /**
   * Handles the sign-out process by calling Supabase auth.
   * An alert is shown on error. On success, the main App component's
   * `onAuthStateChange` listener will automatically handle navigation.
   */  
  const handleSignOut = async (): Promise<void> => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      Alert.alert("Sign Out Error", error.message);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={PALETTE.primary} />
      </View>
    );
  }

  const initials = userProfile
    ? `${userProfile.first_name.charAt(0)}${userProfile.last_name.charAt(0)}`
    : "";

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Account</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          {userProfile && (
            <>
              <Text
                style={styles.userName}
              >{`${userProfile.first_name} ${userProfile.last_name}`}</Text>
              <Text style={styles.userEmail}>{userProfile.email}</Text>
              <View style={styles.roleBadge}>
                <Text style={styles.roleText}>{userRole}</Text>
              </View>
            </>
          )}
        </View>

        <TouchableOpacity style={styles.actionButton} onPress={handleSignOut}>
          <LogOut size={20} color={PALETTE.danger} />
          <Text style={styles.actionButtonText}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default AccountScreen;