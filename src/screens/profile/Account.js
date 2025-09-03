import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { Button } from '../../components/common';
import { COLORS, FONTS, STYLES } from '../../components/styles/constants';

const Account = ({ navigation }) => {
  const handleExitAccount = () => {
    // Navigate back to login screen
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Account</Text>
        
        {/* Exit Button */}
        <View style={styles.exitContainer}>
          <Button
            text="Exit"
            onPress={handleExitAccount}
            style={styles.exitButton}
            textStyle={styles.exitButtonText}
          />
        </View>
      </View>

      {/* Content Area with gray background (matching PropertyListScreen) */}
      <View style={styles.contentArea}>
        <View style={styles.content}>
          {/* Profile Section */}
          <View style={styles.profileSection}>
            {/* Profile Picture */}
            <View style={styles.profilePicture}>
              <Text style={styles.profilePictureText}>👤</Text>
            </View>

            {/* User Information */}
            <View style={styles.userInfo}>
              <Text style={styles.fullName}>Antonio</Text>
              <Text style={styles.phoneNumber}>+61123213</Text>
              <Text style={styles.email}>xyz.com</Text>
            </View>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  // Main Container
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  
  // Header Section (matching PropertyListScreen)
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: STYLES.spacing.lg,
    paddingTop: STYLES.spacing.lg,
    paddingBottom: STYLES.spacing.md,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.textfield,
    ...STYLES.shadow,
  },
  headerTitle: {
    ...FONTS.screenTitle,
    flex: 1,
  },
  exitContainer: {
    alignItems: 'flex-end',
  },
  
  // Content Area with gray background (matching PropertyListScreen)
  contentArea: {
    flex: 1,
    paddingHorizontal: STYLES.spacing.lg,
    paddingTop: STYLES.spacing.md,
    backgroundColor: COLORS.textfield,
  },
  content: {
    flex: 1,
    paddingTop: STYLES.spacing.lg,
  },

  // Profile Section
  profileSection: {
    alignItems: 'center',
    marginBottom: STYLES.spacing.xxl * 3,
  },
  profilePicture: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: STYLES.spacing.xl,
    ...STYLES.shadow,
  },
  profilePictureText: {
    fontSize: 60,
  },
  userInfo: {
    alignItems: 'center',
  },
  fullName: {
    ...FONTS.screenTitle,
    fontSize: 24,
    marginBottom: STYLES.spacing.sm,
  },
  phoneNumber: {
    ...FONTS.commonText,
    fontSize: 16,
    color: COLORS.black,
    opacity: 0.7,
    marginBottom: STYLES.spacing.xs,
  },
  email: {
    ...FONTS.commonText,
    fontSize: 16,
    color: COLORS.black,
    opacity: 0.7,
  },

  // Exit Button (matching dropdown field size)
  exitButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#FF3B30',
    width: 60,
    height: 35,
    borderRadius: STYLES.borderRadius.medium,
  },
  exitButtonText: {
    color: '#FF3B30',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default Account;
