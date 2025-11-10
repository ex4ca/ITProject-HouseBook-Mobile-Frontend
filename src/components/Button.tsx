import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from "react-native";
import { PALETTE } from "../styles/palette";
import { STYLES } from "../styles/globalStyles";

/**
 * Defines the properties accepted by the Button component.
 */
interface ButtonProps {
  text: string;
  onPress: () => void;
  style?: ViewStyle | ViewStyle[];
  textStyle?: TextStyle | TextStyle[];
  disabled?: boolean;
}

/**
 * A reusable button component.
 *
 * This component wraps `TouchableOpacity` to provide a standardized
 * look and feel, including support for a disabled state.
 */
const Button = ({
  text,
  onPress,
  style = {},
  textStyle = {},
  disabled = false,
}: ButtonProps) => {
  const buttonStyles = [
    styles.button,
    disabled && styles.disabledButton,
    style,
  ];

  const textStyles = [
    styles.buttonText,
    disabled && styles.disabledText,
    textStyle,
  ];

  return (
    <TouchableOpacity
      style={buttonStyles}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
    >
      <Text style={textStyles}>{text}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: PALETTE.primary,
    borderRadius: STYLES.borderRadius.medium,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
    height: 58,
  },
  disabledButton: {
    backgroundColor: PALETTE.border,
  },
  buttonText: {
    color: PALETTE.primaryForeground,
    fontWeight: "600",
    fontSize: 16,
    textAlign: "center",
  },
  disabledText: {
    color: PALETTE.textSecondary,
  },
});

export default Button;
