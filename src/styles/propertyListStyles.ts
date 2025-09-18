import { StyleSheet } from 'react-native';
import { PALETTE } from './palette';
import { STYLES } from './globalStyles';

export const propertyListStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: PALETTE.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    minHeight: 300,
  },
  listContentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  header: {
    paddingVertical: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: PALETTE.textPrimary,
  },
  headerSubtitle: {
    fontSize: 16,
    color: PALETTE.textSecondary,
    marginTop: 4,
  },
  overviewCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: PALETTE.card,
    borderRadius: STYLES.borderRadius.medium,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: PALETTE.border,
  },
  overviewTextContainer: {
    marginLeft: 16,
  },
  overviewLabel: {
    fontSize: 14,
    color: PALETTE.textSecondary,
  },
  overviewValue: {
    fontSize: 20,
    fontWeight: '600',
    color: PALETTE.textPrimary,
  },
  listTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: PALETTE.textPrimary,
    marginBottom: 16,
  },
  propertyCard: {
    backgroundColor: PALETTE.card,
    borderRadius: STYLES.borderRadius.medium,
    marginBottom: 16,
    flexDirection: 'row',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: PALETTE.border,
    minHeight: 120, 
  },
  propertyImage: {
    width: 100,
    height: '100%', 
    backgroundColor: PALETTE.border,
  },
  propertyInfo: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    justifyContent: 'space-around', 
  },
    propertyName: {
    fontSize: 18,
    fontWeight: '600',
    color: PALETTE.textPrimary,
    flexShrink: 1, 
  },
  propertyAddress: {
    fontSize: 14,
    color: PALETTE.textSecondary,
    marginBottom: 4,
  },
  propertyDate: {
    fontSize: 12,
    color: PALETTE.textSecondary,
    opacity: 0.8,
  },
  emptyListText: {
    fontSize: 16,
    color: PALETTE.textSecondary,
    textAlign: 'center',
  },
  propertyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  statusBadge: {
    backgroundColor: '#111827',
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 10,
    marginLeft: 8,
  },
  statusBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },
  ownerText: {
    fontSize: 13,
    color: PALETTE.textSecondary,
    marginBottom: 6,
  }
});
