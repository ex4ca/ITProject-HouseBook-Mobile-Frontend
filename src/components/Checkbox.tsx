import React from "react";
import {
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from "react-native";
import { Check } from "lucide-react-native";
import { PALETTE } from "../styles/palette";
import { STYLES } from "../styles/globalStyles";

/**
 * Defines the properties accepted by the Checkbox component.
 */
interface CheckboxProps {
  checked: boolean;
  onPress: () => void;
  label?: string | React.ReactElement;
  style?: ViewStyle;
  checkboxStyle?: ViewStyle;
  labelStyle?: TextStyle;
  size?: number;
}

/**
 * A reusable checkbox component.
 * 
 * This component provides a tappable area including a visual box and an
 * optional label. It supports both string and custom React element labels.
 */
const Checkbox = ({
  checked = false,
  onPress,
  label,
  style = {},
  checkboxStyle = {},
  labelStyle = {},
  size = 24,
}: CheckboxProps) => {
  return (
    <TouchableOpacity
      style={[styles.container, style]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View
        style={[
          styles.checkboxBox,
          {
            width: size,
            height: size,
            backgroundColor: checked ? PALETTE.primary : PALETTE.card,
            borderColor: checked ? PALETTE.primary : PALETTE.border,
          },
          checkboxStyle,
        ]}
      >
        {checked && <Check color={PALETTE.card} size={size * 0.7} />}
      </View>
      {typeof label === "string" ? (
        <Text style={[styles.label, labelStyle]}>{label}</Text>
      ) : (
        label
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: STYLES.spacing.sm,
  },
  checkboxBox: {
    borderWidth: 2,
    borderRadius: STYLES.borderRadius.small,
    alignItems: "center",
    justifyContent: "center",
    marginRight: STYLES.spacing.md,
  },
  label: {
    fontSize: 14,
    color: PALETTE.textSecondary,
    flex: 1,
  },
});

export default Checkbox;
