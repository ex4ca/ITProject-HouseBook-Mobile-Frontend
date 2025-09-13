import { StyleSheet } from 'react-native';
import { PALETTE } from './pallete';

export const authStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: PALETTE.background,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  appName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: PALETTE.textPrimary,
  },
  subtitle: {
    fontSize: 16,
    color: PALETTE.textSecondary,
    marginTop: 4,
  },
  card: {
    backgroundColor: PALETTE.card,
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  roleSelector: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 24,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: PALETTE.secondary,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  activeRoleBadge: {
    backgroundColor: PALETTE.card,
    borderColor: PALETTE.border,
  },
  roleText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '500',
    color: PALETTE.secondaryForeground,
  },
  activeRoleText: {
    color: PALETTE.textPrimary,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: PALETTE.secondary,
    borderRadius: 10,
    padding: 4,
    marginBottom: 24,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: PALETTE.card,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    color: PALETTE.textSecondary,
  },
  activeTabText: {
    color: PALETTE.textPrimary,
  },
  formContainer: {},
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: PALETTE.textPrimary,
    marginBottom: 8,
  },
  nameContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  termsText: {
    color: PALETTE.textSecondary,
    marginLeft: 8,
  },
  linkText: {
    color: PALETTE.ring,
    fontWeight: '600',
  },
  submitButton: {
    marginTop: 24,
    backgroundColor: PALETTE.primary,
    height: 50,
    borderRadius: 10,
  },
  submitButtonText: {
    color: PALETTE.primaryForeground,
    fontSize: 16,
    fontWeight: 'bold',
  },
});
