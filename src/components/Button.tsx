import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { PALETTE } from '../styles/palette';
import { STYLES } from '../styles/globalStyles';

// Defines the shape of the props that this component accepts.
interface ButtonProps {
  text: string;
  onPress: () => void;
  style?: ViewStyle | ViewStyle[];
  textStyle?: TextStyle | TextStyle[];
  disabled?: boolean;
}

// This updated syntax directly types the props object and avoids the 'FC' error.
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
    borderRadius: STYLES.borderRadius.medium, // Using the global style
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    height: 58,
  },
  disabledButton: {
    backgroundColor: PALETTE.border,
  },
  buttonText: {
    color: PALETTE.primaryForeground,
    fontWeight: '600',
    fontSize: 16,
    textAlign: 'center',
  },
  disabledText: {
    color: PALETTE.textSecondary,
  },
});

export default Button;

