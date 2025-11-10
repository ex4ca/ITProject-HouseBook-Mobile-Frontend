import React from "react";
import { View, Text } from "react-native";
import { propertyDetailsStyles as styles } from "../styles/propertyDetailsStyles";

/**
 * Defines the properties accepted by the SpecificationDetails component.
 */
export default function SpecificationDetails({
  specifications,
}: {
  specifications: Record<string, any>;
}) {
  return (
    <View style={styles.specificationsBox}>
      {Object.entries(specifications).map(([key, value]) => (
        <View key={key} style={styles.specPair}>
          <Text style={styles.specKey}>{key}</Text>
          <Text style={styles.specValue}>{String(value)}</Text>
        </View>
      ))}
    </View>
  );
}
