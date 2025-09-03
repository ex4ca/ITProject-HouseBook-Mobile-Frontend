import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { Button } from '../../components/common';
import { COLORS, FONTS, STYLES } from '../../components/styles/constants';
import { mockUsers } from '../../constants/mockData';

const Role = ({ navigation, property, isOwner = true }) => {
  // Select appropriate user based on owner status
  const [user] = useState(isOwner ? mockUsers[0] : mockUsers[1]);
  const [selectedTab, setSelectedTab] = useState('my-role');

  const UserProfile = ({ name, phone, roles }) => (
    <View style={styles.userProfile}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>👤</Text>
      </View>
      <Text style={styles.userName}>{name}</Text>
      <Text style={styles.userPhone}>{phone}</Text>
      
      <View style={styles.rolesContainer}>
        {roles.map((role, index) => (
          <View key={index} style={styles.roleTag}>
            <Text style={styles.roleText}>{role}</Text>
            <TouchableOpacity style={styles.removeRole}>
              <Text style={styles.removeRoleText}>×</Text>
            </TouchableOpacity>
          </View>
        ))}
        <Button
          text="+"
          onPress={() => console.log('Add role')}
          style={styles.addRole}
          textStyle={styles.addRoleText}
        />
      </View>
    </View>
  );

  const PropertyOwnerInfo = () => (
    <View style={styles.ownerSection}>
      <Text style={styles.sectionTitle}>Property Owner</Text>
      <Text style={styles.ownerName}>Name: Antonio</Text>
      <Text style={styles.ownerPhone}>Phone: 111111</Text>
      <Text style={styles.ownerEmail}>Email: xyz.com</Text>
    </View>
  );

  const AuthorityManagement = () => (
    <View style={styles.authoritySection}>
      <Text style={styles.sectionTitle}>Authority Management</Text>
      
      {/* User List */}
      <View style={styles.usersList}>
        <View style={styles.userRow}>
          <View style={styles.userInfo}>
            <View style={styles.smallAvatar}>
              <Text style={styles.smallAvatarText}>👤</Text>
            </View>
            <View style={styles.userDetails}>
              <Text style={styles.userRowName}>Antonio</Text>
              <View style={styles.userRoles}>
                <Text style={styles.userRoleTag}>painter</Text>
                <Text style={styles.userRoleTag}>electrician</Text>
              </View>
            </View>
          </View>
          <TouchableOpacity style={styles.settingsButton}>
            <Text style={styles.settingsIcon}>⚙️</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.userRow}>
          <View style={styles.userInfo}>
            <View style={styles.smallAvatar}>
              <Text style={styles.smallAvatarText}>👤</Text>
            </View>
            <View style={styles.userDetails}>
              <Text style={styles.userRowName}>Antonio</Text>
              <View style={styles.userRoles}>
                <Text style={styles.userRoleTag}>painter</Text>
              </View>
            </View>
          </View>
          <TouchableOpacity style={styles.settingsButton}>
            <Text style={styles.settingsIcon}>⚙️</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Request Counter */}
      <View style={styles.requestContainer}>
        <Button
          text="Request"
          onPress={() => console.log('Request pressed')}
          style={styles.requestButton}
          textStyle={styles.requestText}
        />
        <View style={styles.requestBadge}>
          <Text style={styles.requestCount}>0</Text>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.navigate('Properties')}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Role</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <UserProfile
            name={user.name}
            phone={user.phone}
            roles={user.roles}
          />
        </View>
        
        {/* Property Owner Info - Only for tradies */}
        {!isOwner && <PropertyOwnerInfo />}
        
        {/* Authority Management - Only for owners */}
        {isOwner && <AuthorityManagement />}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: STYLES.spacing.lg,
    paddingTop: STYLES.spacing.sm,
    paddingBottom: STYLES.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.textfield,
    backgroundColor: COLORS.white,
    ...STYLES.shadow,
  },
  backButton: {
    padding: 5,
  },
  backButtonText: {
    ...FONTS.commonText,
    fontSize: 24,
  },
  headerTitle: {
    ...FONTS.screenTitle,
    fontSize: 18,
    flex: 1,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 34, // Same width as back button to center the title
  },
  content: {
    flex: 1,
    paddingHorizontal: STYLES.spacing.lg,
    backgroundColor: COLORS.textfield,
  },
  section: {
    backgroundColor: COLORS.white,
    borderRadius: STYLES.borderRadius.medium,
    padding: STYLES.spacing.lg,
    marginTop: STYLES.spacing.lg,
    marginBottom: STYLES.spacing.md,
    ...STYLES.shadow,
  },

  userProfile: {
    alignItems: 'center',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.textfield,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: STYLES.spacing.md,
  },
  avatarText: {
    fontSize: 40,
  },
  userName: {
    ...FONTS.commonText,
    fontSize: 20,
    marginBottom: STYLES.spacing.xs,
  },
  userPhone: {
    ...FONTS.hintText,
    fontSize: 16,
    marginBottom: STYLES.spacing.lg,
  },
  rolesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
  },
  roleTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e0e0e0',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginHorizontal: 5,
    marginBottom: 10,
  },
  roleText: {
    fontSize: 14,
    color: '#333',
    marginRight: 8,
  },
  removeRole: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#999',
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeRoleText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  addRole: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.secondary,
    marginHorizontal: STYLES.spacing.xs,
  },
  addRoleText: {
    fontSize: 18,
    color: COLORS.black,
  },
  ownerSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  ownerName: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
    fontWeight: '500',
  },
  ownerPhone: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
    fontWeight: '500',
  },
  ownerEmail: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  authoritySection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginTop: 20,
    marginBottom: 20,
  },
  usersList: {
    marginBottom: 20,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  smallAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e0e0e0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  smallAvatarText: {
    fontSize: 20,
  },
  userDetails: {
    flex: 1,
  },
  userRowName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  userRoles: {
    flexDirection: 'row',
  },
  userRoleTag: {
    fontSize: 12,
    color: '#666',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginRight: 5,
  },
  settingsButton: {
    padding: 10,
  },
  settingsIcon: {
    fontSize: 18,
  },
  requestContainer: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  requestButton: {
    backgroundColor: COLORS.secondary,
    paddingHorizontal: STYLES.spacing.lg,
    paddingVertical: STYLES.spacing.sm,
    borderRadius: STYLES.borderRadius.small,
    marginRight: STYLES.spacing.sm,
    height: 40,
  },
  requestText: {
    ...FONTS.hintText,
    fontSize: 16,
  },
  requestBadge: {
    backgroundColor: COLORS.black,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  requestCount: {
    ...FONTS.highlightText,
    fontSize: 12,
  },
  bottomTabs: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingVertical: 10,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
  },
  activeTab: {
    backgroundColor: '#f0f0f0',
  },
  tabIcon: {
    fontSize: 24,
  },
});

export default Role;
