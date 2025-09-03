import React, { useState, useEffect } from 'react';
import { TextInput, View, StyleSheet } from 'react-native';
import { COLORS, FONTS, STYLES } from '../styles/constants';

// Inject CSS to remove outline on web
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    input, textarea, select {
      outline: none !important;
      outline-width: 0 !important;
      outline-style: none !important;
      border: none !important;
      box-shadow: none !important;
    }
    input:focus, textarea:focus, select:focus {
      outline: none !important;
      outline-width: 0 !important;
      outline-style: none !important;
      border: none !important;
      box-shadow: none !important;
    }
  `;
  document.head.appendChild(style);
}

/**
 * Reusable TextField Component
 * @param {Object} props
 * @param {string} props.placeholder - Hint text to display
 * @param {string} props.value - Current text value
 * @param {function} props.onChangeText - Function to call when text changes
 * @param {Object} props.style - Additional styles for the container
 * @param {Object} props.inputStyle - Additional styles for the text input
 * @param {number} props.width - TextField width (optional)
 * @param {number} props.height - TextField height (optional)
 * @param {boolean} props.secureTextEntry - Whether to hide text (for passwords)
 * @param {string} props.keyboardType - Keyboard type (default, email-address, numeric, etc.)
 * @param {boolean} props.multiline - Whether to allow multiple lines
 * @param {boolean} props.editable - Whether the field is editable
 */
const TextField = ({
  placeholder,
  value,
  onChangeText,
  style = {},
  inputStyle = {},
  width,
  height = 50,
  secureTextEntry = false,
  keyboardType = 'default',
  multiline = false,
  editable = true,
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const containerStyles = [
    styles.container,
    {
      width: width,
      height: multiline ? Math.max(height, 80) : height,
      borderColor: isFocused ? COLORS.secondary : 'transparent',
      borderWidth: isFocused ? 1 : 0,
    },
    style,
  ];

  const textInputStyles = [
    styles.textInput,
    {
      height: multiline ? '100%' : height - 4, // Account for padding
      fontSize: Math.min(height * 0.35, FONTS.hintText.fontSize), // Scale text based on height
      // Force remove outline on web
      outline: 'none !important',
      outlineWidth: '0 !important',
      borderWidth: '0 !important',
      boxShadow: 'none !important',
    },
    inputStyle,
  ];

  return (
    <View style={containerStyles}>
      <TextInput
        style={textInputStyles}
        placeholder={placeholder}
        placeholderTextColor={`${FONTS.hintText.color}${Math.round(FONTS.hintText.opacity * 255).toString(16).padStart(2, '0')}`}
        value={value}
        onChangeText={onChangeText}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        multiline={multiline}
        editable={editable}
        textAlignVertical={multiline ? 'top' : 'center'}
        // Web-specific props to remove outline
        autoComplete="off"
        spellCheck={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.textfield,
    borderRadius: STYLES.borderRadius.medium,
    paddingHorizontal: STYLES.spacing.md,
    paddingVertical: STYLES.spacing.xs,
    ...STYLES.shadow,
    justifyContent: 'center',
  },
  textInput: {
    flex: 1,
    color: FONTS.commonText.color,
    fontWeight: FONTS.commonText.fontWeight,
    fontSize: FONTS.hintText.fontSize,
    paddingVertical: 0, // Remove default padding
    textAlign: 'left',
    // Comprehensive outline removal for web
    outline: 'none',
    outlineWidth: 0,
    outlineStyle: 'none',
    borderWidth: 0,
    borderStyle: 'none',
    boxShadow: 'none',
    // Focus styles
    ':focus': {
      outline: 'none',
      outlineWidth: 0,
      borderWidth: 0,
      boxShadow: 'none',
    },
  },
});

export default TextField;
