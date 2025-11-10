import React from "react";
import { Modal, View, Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Button from "./Button";
import { PALETTE } from "../styles/palette";
import { STYLES } from "../styles/globalStyles";

/**
 * Defines the properties accepted by the ConfirmModal component.
 */
interface ConfirmModalProps {
  visible: boolean;
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * A reusable modal component for confirming user actions.
 *
 * It displays an overlay, a content box with a title and message,
 * and two action buttons (e.g., "Yes" and "Cancel").
 */
export default function ConfirmModal({
  visible,
  title = "Confirm",
  message = "Are you sure you want to continue?",
  confirmText = "Yes",
  cancelText = "Cancel",
  destructive = false,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onCancel}
    >
      <SafeAreaView style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
          <View style={styles.actions}>
            <Button
              text={cancelText}
              onPress={onCancel}
              style={styles.cancelButton}
              textStyle={styles.cancelText}
            />
            <Button
              text={confirmText}
              onPress={onConfirm}
              style={[styles.confirmButton, destructive && styles.destructive]}
              textStyle={styles.confirmText}
            />
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    width: "90%",
    backgroundColor: PALETTE.card,
    borderRadius: STYLES.borderRadius.medium,
    padding: 20,
    borderWidth: 1,
    borderColor: PALETTE.border,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: PALETTE.textPrimary,
    marginBottom: 8,
  },
  message: {
    fontSize: 15,
    color: PALETTE.textSecondary,
    marginBottom: 16,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: PALETTE.background,
    borderWidth: 1,
    borderColor: PALETTE.border,
    height: 48,
  },
  cancelText: {
    color: PALETTE.textPrimary,
  },
  confirmButton: {
    flex: 1,
    height: 48,
  },
  destructive: {
    backgroundColor: PALETTE.dangerBackground,
  },
  confirmText: {
    color: PALETTE.primaryForeground,
  },
});
