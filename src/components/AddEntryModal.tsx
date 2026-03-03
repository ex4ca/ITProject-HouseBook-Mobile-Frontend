import React, { useState } from "react";
import { View, Text, Modal, TextInput, Alert } from "react-native";
import { componentDetailsStyles as styles } from "../styles/componentDetailsStyles";
import { PALETTE } from "../styles/palette";
import Button from "./Button";

/**
 * A modal form for adding a new history entry.
 */
const AddEntryModal = ({
  visible,
  onClose,
  onSubmit,
}: {
  visible: boolean;
  onClose: () => void;
  onSubmit: (description: string) => void;
}) => {
  const [description, setDescription] = useState("");

  /**
   * Handles the submission of the form.
   * Validates input and calls the onSubmit prop.
   */
  const handleSubmit = () => {
    if (!description.trim()) {
      Alert.alert(
        "Missing Information",
        "Please provide a description for the entry.",
      );
      return;
    }
    onSubmit(description);
    setDescription(""); // Reset after submit
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Add New History Entry</Text>
          <TextInput
            style={[
              styles.modalInput,
              { height: 100, textAlignVertical: "top" },
            ]}
            placeholder="Description of work or update..."
            value={description}
            onChangeText={setDescription}
            multiline
          />
          <View style={styles.modalButtons}>
            <Button
              text="Cancel"
              onPress={onClose}
              style={{ backgroundColor: PALETTE.background }}
              textStyle={{ color: PALETTE.textPrimary }}
            />
            <Button text="Add Entry" onPress={handleSubmit} />
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default AddEntryModal;
