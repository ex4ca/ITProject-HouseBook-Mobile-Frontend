import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { COLORS, FONTS, STYLES } from '../styles/constants';

/**
 * Reusable Checkbox Component
 * @param {Object} props
 * @param {boolean} props.checked - Whether the checkbox is checked
 * @param {function} props.onPress - Function to call when checkbox is pressed
 * @param {string} props.label - Label text to display next to checkbox
 * @param {Object} props.style - Additional styles for the container
 * @param {Object} props.checkboxStyle - Additional styles for the checkbox box
 * @param {Object} props.labelStyle - Additional styles for the label text
 * @param {number} props.size - Size of the checkbox (default: 20)
 */
const Checkbox = ({
  checked = false,
  onPress,
  label,
  style = {},
  checkboxStyle = {},
  labelStyle = {},
  size = 20,
}) => {
  const containerStyles = [styles.container, style];
  
  const checkboxBoxStyles = [
    styles.checkboxBox,
    {
      width: size,
      height: size,
      borderColor: checked ? COLORS.primary : COLORS.black,
      backgroundColor: checked ? COLORS.primary : 'transparent',
    },
    checkboxStyle,
  ];

  const labelStyles = [styles.label, labelStyle];

  return (
    <TouchableOpacity style={containerStyles} onPress={onPress} activeOpacity={0.7}>
      <View style={checkboxBoxStyles}>
        {checked && <Text style={styles.checkmark}>✓</Text>}
      </View>
      {label && <Text style={labelStyles}>{label}</Text>}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkboxBox: {
    borderWidth: 2,
    borderRadius: STYLES.borderRadius.small / 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: STYLES.spacing.sm,
  },
  checkmark: {
    ...FONTS.highlightText,
    fontSize: 12,
    lineHeight: 12,
  },
  label: {
    ...FONTS.smallText,
    fontSize: 14,
    flex: 1,
    opacity: 0.8,
  },
});

export default Checkbox;
