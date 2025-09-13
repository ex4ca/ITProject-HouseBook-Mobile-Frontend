import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { Check } from 'lucide-react-native';
import { PALETTE } from '../styles/palette';
import { STYLES } from '../styles/globalStyles';

interface CheckboxProps {
  checked: boolean;
  onPress: () => void;
  label?: string | React.ReactElement;
  style?: ViewStyle;
  checkboxStyle?: ViewStyle;
  labelStyle?: TextStyle;
  size?: number;
}

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
    <TouchableOpacity style={[styles.container, style]} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.checkboxBox, { width: size, height: size, backgroundColor: checked ? PALETTE.primary : PALETTE.card, borderColor: checked ? PALETTE.primary : PALETTE.border }, checkboxStyle]}>
        {checked && <Check color={PALETTE.card} size={size * 0.7} />}
      </View>
      {/* This now works whether the label is a string or a component */}
      {typeof label === 'string' ? <Text style={[styles.label, labelStyle]}>{label}</Text> : label}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: STYLES.spacing.sm,
  },
  checkboxBox: {
    borderWidth: 2,
    borderRadius: STYLES.borderRadius.small,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: STYLES.spacing.md,
  },
  label: {
    fontSize: 14,
    color: PALETTE.textSecondary,
    flex: 1,
  },
});

export default Checkbox;