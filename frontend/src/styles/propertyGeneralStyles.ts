import { StyleSheet, Dimensions } from 'react-native';
import { PALETTE } from './palette';
import { STYLES } from './globalStyles';

const { width } = Dimensions.get('window');

export const propertyGeneralStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: PALETTE.card,
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
    textAlign: 'center',
    flex: 1,
    marginHorizontal: 8,
  },
  imageSection: {
    height: 250,
    backgroundColor: PALETTE.border,
  },
  imageSlide: {
    width: width,
    height: '100%',
  },
  propertyImage: {
    width: '100%',
    height: '100%',
  },
  detailsContainer: {
    padding: 20,
    backgroundColor: PALETTE.background,
  },
  propertyName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: PALETTE.textPrimary,
  },
  propertyAddress: {
    fontSize: 16,
    color: PALETTE.textSecondary,
    marginTop: 4,
    marginBottom: 24,
  },
  detailsCard: {
    backgroundColor: PALETTE.card,
    borderRadius: STYLES.borderRadius.medium,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: PALETTE.border,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: PALETTE.textPrimary,
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '48%',
    marginBottom: 16,
  },
  statTextContainer: {
    marginLeft: 12,
  },
  statLabel: {
    fontSize: 14,
    color: PALETTE.textSecondary,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
    color: PALETTE.textPrimary,
  },
  descriptionText: {
    fontSize: 16,
    color: PALETTE.textSecondary,
    lineHeight: 24,
  },
  emptyText: {
      fontSize: 16,
      color: PALETTE.textSecondary,
  },
  specGroup: {
    marginBottom: 16,
  },
  specificationsBox: {
    backgroundColor: PALETTE.background,
    borderRadius: STYLES.borderRadius.small,
    padding: 12,
    borderWidth: 1,
    borderColor: PALETTE.border,
  },
  specPair: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  specPairBorder: {
    borderBottomWidth: 1,
    borderBottomColor: PALETTE.border,
  },
  specKey: {
    fontSize: 14,
    color: PALETTE.textSecondary,
    textTransform: 'capitalize',
  },
  specValue: {
    fontSize: 14,
    color: PALETTE.textPrimary,
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
    marginLeft: 10,
  },
  
  // NEW STYLES FOR QR CODE
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitleWithIcon: {
    fontSize: 18,
    fontWeight: '600',
    color: PALETTE.textPrimary,
    marginLeft: 10,
  },
  qrCodeContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 16,
  },
  qrCodeDescription: {
    fontSize: 14,
    color: PALETTE.textSecondary,
    textAlign: 'center',
    marginTop: 12,
  },
});