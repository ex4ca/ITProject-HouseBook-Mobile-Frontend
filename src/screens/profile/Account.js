import React, {useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useFocusEffect, useRoute } from '@react-navigation/native';
import { supabase } from '../../config/supabaseClient';
import { User, LogOut } from 'lucide-react-native';

// Consistent color palette for the Notion-like design.
const PALETTE = {
  background: '#F8F9FA',
  card: '#FFFFFF',
  textPrimary: '#111827',
  textSecondary: '#6B7280',
  primary: '#111827',
  border: '#E5E7EB',
  danger: '#DC2626',
};

// Main component for the user's account screen.
const AccountScreen = () => {
  const route = useRoute();
  const { userRole: selectedRole } = route.params || { userRole: 'owner' };
  
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);
  const [userRole, setUserRole] = useState('');

  // Fetches data every time the screen comes into view.
  useFocusEffect(
    useCallback(() => {
      const fetchData = async () => {
        setLoading(true);
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) throw new Error("No user logged in.");

          // Fetch user profile and set role from navigation params
          const profile = await fetchUserProfile(user.id);
          setUserProfile(profile);
          setUserRole(selectedRole === 'owner' ? 'Property Owner' : 'Trade Person');

        } catch (error) {
          console.error("Error fetching account data:", error.message);
          setUserProfile(null);
          setUserRole('');
        } finally {
          setLoading(false);
        }
      };

      fetchData();
    }, [selectedRole])
  );

  // Fetches the user's first name, last name, and email.
  const fetchUserProfile = async (userId) => {
    const { data, error } = await supabase
      .from('User')
      .select('first_name, last_name, email')
      .eq('user_id', userId)
      .single();
    if (error) throw error;
    return data;
  };


  // Handles the sign-out process.
  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      Alert.alert('Sign Out Error', error.message);
    }
    // The onAuthStateChange listener in App.js will handle navigation.
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
    : '';

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
              <Text style={styles.userName}>{`${userProfile.first_name} ${userProfile.last_name}`}</Text>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: PALETTE.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: PALETTE.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: PALETTE.card,
    borderBottomWidth: 1,
    borderBottomColor: PALETTE.border,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: PALETTE.textPrimary,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  profileCard: {
    backgroundColor: PALETTE.card,
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: PALETTE.border,
    marginBottom: 24,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: PALETTE.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: PALETTE.textSecondary,
    textTransform: 'uppercase',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: PALETTE.textPrimary,
  },
  userEmail: {
    fontSize: 16,
    color: PALETTE.textSecondary,
    marginTop: 4,
    marginBottom: 16,
  },
  roleBadge: {
    backgroundColor: PALETTE.primary,
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  roleText: {
    color: PALETTE.card,
    fontSize: 14,
    fontWeight: '500',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: PALETTE.card,
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: PALETTE.border,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: PALETTE.danger,
    marginLeft: 12,
  },
});

export default AccountScreen;