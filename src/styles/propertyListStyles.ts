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
  },
  propertyImage: {
    width: 100,
    height: '100%',
    backgroundColor: PALETTE.border,
  },
  propertyInfo: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
  },
  propertyName: {
    fontSize: 18,
    fontWeight: '600',
    color: PALETTE.textPrimary,
    marginBottom: 4,
  },
  propertyAddress: {
    fontSize: 14,
    color: PALETTE.textSecondary,
    marginBottom: 8,
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
});
