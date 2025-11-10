import React, { useState } from "react";
import { View, Text, TouchableOpacity, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ChevronLeft } from "lucide-react-native";
import { propertyRequestsStyles as styles } from "../../styles/requestStyles";
import { PALETTE } from "../../styles/palette";

/**
 * A screen component that prompts the user to enter a PIN
 * to gain access to a property.
 *
 * This screen is typically navigated to after an initial step
 * (like scanning a QR code) and receives `scannedText` via
 * route parameters to provide context to the user (e.g., the property address).
 */
const PropertyPin = ({
  route,
  navigation,
}: {
  route: any;
  navigation: any;
}) => {
  const scannedText =
    route.params?.scannedText || "Property: 456 Collins Street, Melbourne";
  const [pin, setPin] = useState("");

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <ChevronLeft size={24} color={PALETTE.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Property</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.listContent}>
        <View style={styles.scanCard}>
          <Text style={styles.scanTitle}>Enter PIN</Text>

          <View
            style={{
              backgroundColor: "#F1F1F4",
              padding: 12,
              borderRadius: 8,
              marginBottom: 12,
            }}
          >
            <Text
              style={{ color: PALETTE.textSecondary }}
            >{`Scanned: ${scannedText}`}</Text>
          </View>

          <Text
            style={{
              alignSelf: "flex-start",
              marginBottom: 6,
              color: PALETTE.textSecondary,
            }}
          >
            Property Access PIN
          </Text>
          <TextInput
            style={{
              width: "100%",
              borderWidth: 1,
              borderColor: PALETTE.border,
              borderRadius: 8,
              paddingVertical: 8,
              paddingHorizontal: 12,
              marginBottom: 12,
              textAlign: "center",
            }}
            secureTextEntry
            value={pin}
            onChangeText={setPin}
            placeholder="Enter PIN"
            keyboardType="numeric"
          />

          <Text
            style={[
              styles.emptyText,
              { textAlign: "center", marginBottom: 12 },
            ]}
          >
            Enter the PIN provided by the property owner to gain access.
          </Text>

          <Text style={{ color: PALETTE.textSecondary, marginBottom: 12 }}>
            Demo PIN: 1234
          </Text>

          <TouchableOpacity
            style={styles.simulateButton}
            onPress={() => {
              /* verify action later */
            }}
          >
            <Text style={styles.simulateButtonText}>Verify PIN</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default PropertyPin;
