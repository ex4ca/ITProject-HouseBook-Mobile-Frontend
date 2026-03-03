import React from "react";
import { View, Text } from "react-native";
import { propertyRequestsStyles as styles } from "../styles/requestStyles";

/**
 * Renders a formatted list of key-value specification pairs.
 * It iterates over an object and displays each entry, replacing
 * underscores in the keys with spaces for readability.
 */
const SpecificationDetails = ({
  specifications,
}: {
  specifications: Record<string, any>;
}) => (
  <View style={styles.specificationsBox}>
    {Object.entries(specifications).map(([key, value]) => (
      <View key={key} style={styles.specPair}>
        <Text style={styles.specKey}>{key.replace(/_/g, " ")}</Text>
        <Text style={styles.specValue}>{String(value)}</Text>
      </View>
    ))}
  </View>
);

export default SpecificationDetails;
