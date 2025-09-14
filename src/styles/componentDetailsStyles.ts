import { StyleSheet } from 'react-native';
import { PALETTE } from './palette';
import { STYLES } from './globalStyles';

export const componentDetailsStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: PALETTE.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: STYLES.spacing.lg,
    paddingVertical: STYLES.spacing.md,
    backgroundColor: PALETTE.card,
    borderBottomWidth: 1,
    borderBottomColor: PALETTE.border,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: PALETTE.textPrimary,
    marginLeft: STYLES.spacing.sm,
  },
  content: {
    flex: 1,
    padding: STYLES.spacing.lg,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: PALETTE.textPrimary,
    marginBottom: STYLES.spacing.sm,
  },
  subtitle: {
    fontSize: 16,
    color: PALETTE.textSecondary,
    marginBottom: STYLES.spacing.xl,
  },
  historyEntry: {
    backgroundColor: PALETTE.card,
    borderRadius: STYLES.borderRadius.medium,
    padding: STYLES.spacing.lg,
    marginBottom: STYLES.spacing.md,
    borderWidth: 1,
    borderColor: PALETTE.border,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: STYLES.spacing.md,
  },
  entryDate: {
    fontSize: 12,
    color: PALETTE.textSecondary,
    backgroundColor: PALETTE.background,
    paddingHorizontal: STYLES.spacing.sm,
    paddingVertical: STYLES.spacing.xs,
    borderRadius: STYLES.borderRadius.small,
    overflow: 'hidden', // Ensures borderRadius is applied on iOS
  },
  entryContent: {
    marginBottom: STYLES.spacing.sm,
  },
  entryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: PALETTE.textPrimary,
    marginBottom: STYLES.spacing.xs,
  },
  entryDescription: {
    fontSize: 14,
    color: PALETTE.textSecondary,
    lineHeight: 20,
  },
  floatingAddButton: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: PALETTE.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...STYLES.shadow,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: PALETTE.card,
    borderRadius: STYLES.borderRadius.medium,
    padding: STYLES.spacing.lg,
    width: '90%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: PALETTE.textPrimary,
    marginBottom: STYLES.spacing.lg,
  },
  modalInput: {
    backgroundColor: PALETTE.background,
    borderWidth: 1,
    borderColor: PALETTE.border,
    borderRadius: STYLES.borderRadius.small,
    padding: STYLES.spacing.md,
    fontSize: 16,
    marginBottom: STYLES.spacing.md,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: STYLES.spacing.lg,
  },
  modalButton: {
    paddingVertical: STYLES.spacing.sm,
    paddingHorizontal: STYLES.spacing.lg,
    borderRadius: STYLES.borderRadius.small,
    marginLeft: STYLES.spacing.sm,
  },
  modalConfirmButton: {
    backgroundColor: PALETTE.primary,
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: PALETTE.card,
  },
});