import React, { useState } from "react";
import {
  TextInput,
  View,
  StyleSheet,
  ViewStyle,
  TextStyle,
  KeyboardTypeOptions,
  Platform,
  TextInputProps,
} from "react-native";

import { PALETTE } from "../styles/palette";
import { STYLES } from "../styles/globalStyles";

// Defines the shape of the props that this component accepts.
interface TextFieldProps {
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  style?: ViewStyle;
  inputStyle?: TextStyle;
  secureTextEntry?: boolean;
  keyboardType?: KeyboardTypeOptions;
  multiline?: boolean;
  editable?: boolean;
  autoCapitalize?: TextInputProps["autoCapitalize"];
}

const TextField = ({
  placeholder,
  value,
  onChangeText,
  style = {},
  inputStyle = {},
  secureTextEntry = false,
  keyboardType = "default",
  multiline = false,
  editable = true,
  autoCapitalize = "sentences", // Default value
}: TextFieldProps) => {
  const [isFocused, setIsFocused] = useState(false);

  const containerStyles = [
    styles.container,
    isFocused && styles.containerFocused,
    !editable && styles.containerDisabled,
    style,
  ];

  const textInputStyles = [styles.textInput, inputStyle];

  return (
    <View style={containerStyles}>
      <TextInput
        style={textInputStyles}
        placeholder={placeholder}
        placeholderTextColor={PALETTE.textSecondary}
        value={value}
        onChangeText={onChangeText}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        multiline={multiline}
        editable={editable}
        autoCapitalize={autoCapitalize}
        textAlignVertical={multiline ? "top" : "center"}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: PALETTE.background,
    borderRadius: STYLES.borderRadius.small,
    borderWidth: 1,
    borderColor: PALETTE.border,
    paddingHorizontal: STYLES.spacing.md,
    justifyContent: "center",
    minHeight: 58,
  },
  containerFocused: {
    borderColor: PALETTE.primary,
    borderWidth: 2,
  },
  containerDisabled: {
    backgroundColor: PALETTE.border,
  },
  textInput: {
    color: PALETTE.textPrimary,
    fontSize: 16,
    paddingVertical: Platform.OS === "ios" ? 16 : 12,
  },
});

export default TextField;
