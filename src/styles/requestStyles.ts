import { StyleSheet } from 'react-native';
import { PALETTE } from './palette';
import { STYLES } from './globalStyles';

export const propertyRequestsStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: PALETTE.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: PALETTE.card,
    borderBottomWidth: 1,
    borderBottomColor: PALETTE.border,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: PALETTE.textPrimary,
  },
  listContent: {
    padding: 20,
    flexGrow: 1,
  },
  card: {
    backgroundColor: PALETTE.card,
    borderRadius: STYLES.borderRadius.medium,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: PALETTE.border,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 16,
  },
  cardHeaderText: {
      flex: 1,
  },
  propertyName: {
    fontSize: 18,
    fontWeight: '600',
    color: PALETTE.textPrimary,
  },
  assetName: {
      fontSize: 14,
      color: PALETTE.textSecondary,
      marginTop: 2,
  },
  descriptionText: {
    fontSize: 16,
    fontStyle: 'italic',
    color: PALETTE.textPrimary,
    marginBottom: 8,
    paddingHorizontal: 16,
  },
  submittedBy: {
      fontSize: 12,
      color: PALETTE.textSecondary,
      textAlign: 'right',
      paddingHorizontal: 16,
      paddingBottom: 16,
  },
  expandedContent: {
      borderTopWidth: 1,
      borderColor: PALETTE.border,
      padding: 16,
  },
  detailsTitle: {
      fontSize: 14,
      fontWeight: '500',
      color: PALETTE.textSecondary,
      textTransform: 'uppercase',
      marginBottom: 8,
  },
  specificationsBox: {
    backgroundColor: PALETTE.background,
    borderRadius: STYLES.borderRadius.small,
    padding: 12,
  },
  specPair: {
    flexDirection: 'row',
    paddingVertical: 4,
  },
  specKey: {
    fontWeight: '500',
    width: '40%',
    color: PALETTE.textSecondary,
  },
  specValue: {
    flex: 1,
    color: PALETTE.textPrimary,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    backgroundColor: PALETTE.background,
    padding: 12,
  },
  statusButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginLeft: 8,
  },
  declineButton: {
      backgroundColor: PALETTE.dangerBackground,
  },
  acceptButton: {
      backgroundColor: PALETTE.successBackground,
  },
  statusButtonText: {
    marginLeft: 6,
    fontWeight: '600',
  },
  emptyText: {
    fontSize: 16,
    color: PALETTE.textSecondary,
  },
  // Add property (QR scan) UI styles
  scanCard: {
    backgroundColor: PALETTE.card,
    borderRadius: STYLES.borderRadius.medium,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: PALETTE.border,
  },
  scanTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: PALETTE.textPrimary,
    marginBottom: 12,
  },
  dottedBox: {
    width: '70%',
    maxWidth: 220,
    aspectRatio: 1,
    borderStyle: 'dashed',
    borderWidth: 2,
    borderColor: PALETTE.border,
    borderRadius: 8,
    backgroundColor: '#F6F6F8',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
  },
  qrImage: {
    width: 88,
    height: 88,
    resizeMode: 'contain',
  },
  simulateButton: {
    marginTop: 16,
    backgroundColor: PALETTE.primary,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  simulateButtonText: {
    color: PALETTE.primaryForeground,
    fontWeight: '600',
  },
});
