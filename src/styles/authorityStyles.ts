import { StyleSheet } from 'react-native';
import { PALETTE } from './palette';
import { STYLES } from './globalStyles';

export const authorityStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: PALETTE.card,
  },
  scrollContainer: {
    backgroundColor: PALETTE.background,
    padding: STYLES.spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: STYLES.spacing.lg,
    paddingVertical: STYLES.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: PALETTE.border,
    backgroundColor: PALETTE.card,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: PALETTE.textPrimary,
  },
  section: {
    backgroundColor: PALETTE.card,
    borderRadius: STYLES.borderRadius.medium,
    padding: STYLES.spacing.lg,
    marginBottom: STYLES.spacing.lg,
    borderWidth: 1,
    borderColor: PALETTE.border,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: PALETTE.textPrimary,
    marginBottom: STYLES.spacing.lg,
  },
  userProfile: {
    alignItems: 'center',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: PALETTE.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: STYLES.spacing.md,
  },
  avatarText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: PALETTE.textSecondary,
    textTransform: 'uppercase',
  },
  userName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: PALETTE.textPrimary,
  },
  userEmail: {
    fontSize: 16,
    color: PALETTE.textSecondary,
    marginTop: 4,
  },
  ownerInfoLine: {
    fontSize: 16,
    color: PALETTE.textSecondary,
    marginBottom: STYLES.spacing.sm,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: STYLES.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: PALETTE.border,
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
    backgroundColor: PALETTE.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: STYLES.spacing.md,
  },
  userDetails: {
    flex: 1,
  },
  userRowName: {
    fontSize: 16,
    fontWeight: '600',
    color: PALETTE.textPrimary,
  },
  userStatus: {
    fontSize: 14,
    color: PALETTE.textSecondary,
    textTransform: 'capitalize',
  },
  settingsButton: {
    padding: 8,
  },
});

