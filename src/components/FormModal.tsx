import React from "react";
import { View, Text, TouchableOpacity, ScrollView, Modal } from "react-native";
import { X } from "lucide-react-native";
import { propertyDetailsStyles as styles } from "../styles/propertyDetailsStyles";
import { PALETTE } from "../styles/palette";

/**
 * A reusable modal component for displaying forms.
 */
const FormModal = ({
  visible,
  onClose,
  title,
  children,
  onSubmit,
  submitText = "Add",
}: any) => (
  <Modal
    animationType="slide"
    transparent={true}
    visible={visible}
    onRequestClose={onClose}
  >
    <View style={styles.modalOverlay}>
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>{title}</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color={PALETTE.textSecondary} />
          </TouchableOpacity>
        </View>
        <ScrollView keyboardShouldPersistTaps="handled">{children}</ScrollView>
        <TouchableOpacity style={styles.submitButton} onPress={onSubmit}>
          <Text style={styles.submitButtonText}>{submitText}</Text>
        </TouchableOpacity>
      </View>
    </View>
  </Modal>
);

export default FormModal;
