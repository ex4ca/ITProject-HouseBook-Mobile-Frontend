import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { PALETTE } from '../styles/palette';

type Props = {
  visible: boolean;
  title?: string;
  message?: string;
  destructive?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

export default function ConfirmModal({ visible, title, message, destructive = false, onCancel, onConfirm }: Props) {
  return (
    <Modal animationType="fade" transparent visible={visible} onRequestClose={onCancel}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>{title || 'Confirm'}</Text>
          {message ? <Text style={styles.message}>{message}</Text> : null}
          <View style={styles.actions}>
            <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.confirmButton, destructive ? styles.destructive : null]}
              onPress={onConfirm}
            >
              <Text style={styles.confirmText}>{destructive ? 'Confirm' : 'OK'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 18,
    elevation: 6,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: PALETTE.textPrimary,
    marginBottom: 8,
  },
  message: {
    fontSize: 14,
    color: PALETTE.textSecondary,
    marginBottom: 16,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  cancelButton: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginRight: 8,
  },
  cancelText: {
    color: PALETTE.textSecondary,
    fontSize: 14,
  },
  confirmButton: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: PALETTE.primary,
    borderRadius: 6,
  },
  confirmText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  destructive: {
    backgroundColor: PALETTE.danger,
  },
});
