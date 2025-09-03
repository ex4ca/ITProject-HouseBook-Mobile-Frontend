import React, { useState } from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { COLORS, FONTS, STYLES } from '../styles/constants';

/**
 * Reusable Button Component
 * @param {Object} props
 * @param {string} props.text - Text to display on button
 * @param {function} props.onPress - Function to call when button is pressed
 * @param {Object} props.style - Additional styles for the button container
 * @param {Object} props.textStyle - Additional styles for the button text
 * @param {number} props.width - Button width (optional)
 * @param {number} props.height - Button height (optional)
 * @param {boolean} props.disabled - Whether button is disabled
 */
const Button = ({
  text,
  onPress,
  style = {},
  textStyle = {},
  width,
  height = 50,
  disabled = false,
}) => {
  const [isPressed, setIsPressed] = useState(false);

  const buttonStyles = [
    styles.button,
    {
      backgroundColor: isPressed || disabled ? COLORS.primary2 : COLORS.primary,
      width: width,
      height: height,
      opacity: disabled ? 0.6 : 1,
    },
    style,
  ];

  const textStyles = [
    styles.buttonText,
    {
      fontSize: Math.min(height * 0.4, FONTS.highlightText.fontSize), // Scale text based on button height
    },
    textStyle,
  ];

  return (
    <TouchableOpacity
      style={buttonStyles}
      onPress={onPress}
      onPressIn={() => setIsPressed(true)}
      onPressOut={() => setIsPressed(false)}
      disabled={disabled}
      activeOpacity={0.8}
    >
      <Text style={textStyles}>{text}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: COLORS.primary,
    borderRadius: STYLES.borderRadius.medium,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: STYLES.spacing.md,
    ...STYLES.shadow,
  },
  buttonText: {
    color: FONTS.highlightText.color,
    fontWeight: FONTS.highlightText.fontWeight,
    fontSize: FONTS.highlightText.fontSize,
    textAlign: 'center',
  },
});

export default Button;
