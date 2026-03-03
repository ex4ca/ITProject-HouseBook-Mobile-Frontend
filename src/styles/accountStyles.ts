import { StyleSheet } from "react-native";
import { PALETTE } from "./palette";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: PALETTE.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: PALETTE.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: PALETTE.card,
    borderBottomWidth: 1,
    borderBottomColor: PALETTE.border,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
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
    alignItems: "center",
    borderWidth: 1,
    borderColor: PALETTE.border,
    marginBottom: 24,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: PALETTE.border,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 40,
    fontWeight: "bold",
    color: PALETTE.textSecondary,
    textTransform: "uppercase",
  },
  userName: {
    fontSize: 24,
    fontWeight: "bold",
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
    color: PALETTE.primaryForeground || "#FFFFFF",
    fontSize: 14,
    fontWeight: "500",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: PALETTE.card,
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: PALETTE.border,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: PALETTE.danger,
    marginLeft: 12,
  },
});
