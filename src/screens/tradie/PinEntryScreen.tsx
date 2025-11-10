import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { claimJobWithPin } from "../../services/FetchAuthority";
import { PALETTE } from "../../styles/palette";
import Button from "../../components/Button";

/**
 * A screen component where a user (typically a tradie) enters a PIN
 * to claim a job associated with a property.
 *
 * This screen expects to receive a `propertyId` via route parameters,
 * which it gets after a user scans a property QR code.
 *
 * Features:
 * - A 6-digit PIN input field.
 * - Automatic submission when the PIN length reaches 6 digits.
 * - Calls the `claimJobWithPin` service to validate the request.
 * - Displays success or failure alerts.
 * - Navigates to the main 'Jobs' screen on success.
 * - Clears the PIN and allows retry on failure.
 */
export default function PinEntryScreen() {
  const route = useRoute();
  const navigation: any = useNavigation();
  const { propertyId } = route.params as { propertyId: string };

  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);

  /**
   * Handles the submission of the PIN.
   * It dismisses the keyboard, sets the loading state, and calls the
   * `claimJobWithPin` service.
   *
   * On a successful claim, it shows an alert and navigates the user
   * to their main job list.
   *
   * On a failed claim or an error, it shows an alert and clears the
   * PIN input to allow the user to retry.
   */
  const handleSubmit = async () => {
    // Dismiss the keyboard before showing alerts or navigating
    Keyboard.dismiss();
    if (pin.length < 4 || loading) return;

    setLoading(true);
    try {
      const result = await claimJobWithPin(propertyId, pin);

      Alert.alert(result.success ? "Success" : "Failed", result.message, [
        {
          text: "OK",
          onPress: () => {
            if (result.success) {
              // On success, navigate to the main jobs screen
              navigation.navigate("Main", { screen: "Jobs" });
            } else {
              // On failure, just clear the PIN to allow a retry
              setPin("");
            }
          },
        },
      ]);
    } catch (error: any) {
      Alert.alert(
        "Error",
        error.message || "An unexpected error occurred.",
        [{ text: "OK", onPress: () => setPin("") }],
      );
    } finally {
      setLoading(false);
    }
  };

  // Auto-submit when PIN is 6 digits long
  useEffect(() => {
    if (pin.length === 6) {
      handleSubmit();
    }
  }, [pin]);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.innerContainer}>
          <Text style={styles.title}>Enter Job PIN</Text>
          <Text style={styles.subtitle}>
            Enter the PIN associated with this job to claim it.
          </Text>
          <TextInput
            style={styles.pinInput}
            value={pin}
            onChangeText={setPin}
            keyboardType="number-pad"
            maxLength={6}
            placeholder="••••••"
            placeholderTextColor="#9CA3AF"
          />
          {loading ? (
            <ActivityIndicator
              size="large"
              color={PALETTE.primary}
              style={{ marginTop: 20 }}
            />
          ) : (
            <Button text="Claim Job" onPress={handleSubmit} />
          )}
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: PALETTE.background,
  },
  innerContainer: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    color: PALETTE.textPrimary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    color: PALETTE.textSecondary,
    marginBottom: 32,
  },
  pinInput: {
    backgroundColor: PALETTE.card,
    borderWidth: 1,
    borderColor: PALETTE.border,
    borderRadius: 12,
    padding: 16,
    fontSize: 24,
    textAlign: "center",
    letterSpacing: 8,
    color: PALETTE.textPrimary,
    marginBottom: 24,
  },
});
