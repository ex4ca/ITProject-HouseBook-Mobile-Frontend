import React, { useState, useRef } from 'react';
import { TouchableOpacity, Text, View, StyleSheet, Modal, FlatList } from 'react-native';
import { COLORS, FONTS, STYLES } from '../styles/constants';

/**
 * Reusable DropField Component
 * @param {Object} props
 * @param {Array} props.options - Array of options to display in dropdown
 * @param {string} props.placeholder - Placeholder text when no option is selected
 * @param {string} props.selectedValue - Currently selected value
 * @param {function} props.onSelect - Function to call when an option is selected
 * @param {Object} props.style - Additional styles for the container
 * @param {Object} props.textStyle - Additional styles for the displayed text
 * @param {number} props.width - DropField width (optional)
 * @param {number} props.height - DropField height (optional)
 * @param {boolean} props.disabled - Whether the dropdown is disabled
 */
const DropField = ({
  options = [],
  placeholder = 'Select an option',
  selectedValue,
  onSelect,
  style = {},
  textStyle = {},
  width,
  height = 50,
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ x: 0, y: 0, width: 0 });
  const dropdownRef = useRef(null);

  const toggleDropdown = () => {
    if (!disabled) {
      if (!isOpen) {
        // Measure the dropdown button position before opening
        dropdownRef.current?.measure((x, y, width, height, pageX, pageY) => {
          setDropdownPosition({
            x: pageX,
            y: pageY + height,
            width: width
          });
          setIsOpen(true);
        });
      } else {
        setIsOpen(false);
      }
    }
  };

  const selectOption = (option) => {
    onSelect(option);
    setIsOpen(false);
  };

  const displayText = selectedValue || placeholder;
  const isSelected = !!selectedValue;

  const containerStyles = [
    styles.container,
    {
      backgroundColor: isSelected ? COLORS.primary : COLORS.secondary,
      width: width,
      height: height,
      opacity: disabled ? 0.6 : 1,
    },
    style,
  ];

  const textStyles = [
    styles.text,
    {
      color: isSelected ? COLORS.white : FONTS.hintText.color,
      fontSize: 10, // Fixed smaller font size
    },
    textStyle,
  ];

  // Filter out the currently selected option
  const filteredOptions = options.filter(option => option !== selectedValue);

  const renderOption = ({ item, index }) => (
    <TouchableOpacity
      style={[
        styles.option,
        index === filteredOptions.length - 1 && styles.lastOption
      ]}
      onPress={() => selectOption(item)}
    >
      <Text style={styles.optionText}>{item}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.wrapper}>
      <TouchableOpacity
        ref={dropdownRef}
        style={containerStyles}
        onPress={toggleDropdown}
        disabled={disabled}
      >
        <Text style={textStyles} numberOfLines={1}>
          {displayText}
        </Text>
        <Text style={[styles.arrow, { color: isSelected ? COLORS.white : FONTS.hintText.color }]}>
          {isOpen ? '▲' : '▼'}
        </Text>
      </TouchableOpacity>

      <Modal
        visible={isOpen}
        transparent={true}
        animationType="none"
        onRequestClose={() => setIsOpen(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsOpen(false)}
        >
          <View 
            style={[
              styles.dropdown, 
              {
                position: 'absolute',
                top: dropdownPosition.y,
                left: dropdownPosition.x,
                width: dropdownPosition.width,
              }
            ]}
          >
            <FlatList
              data={filteredOptions}
              renderItem={renderOption}
              keyExtractor={(item, index) => index.toString()}
              showsVerticalScrollIndicator={false}
              style={styles.optionsList}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: 'relative',
    zIndex: 1000,
  },
  container: {
    backgroundColor: COLORS.secondary,
    borderRadius: STYLES.borderRadius.medium,
    paddingHorizontal: STYLES.spacing.md,
    paddingVertical: STYLES.spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...STYLES.shadow,
  },
  text: {
    flex: 1,
    fontWeight: FONTS.hintText.fontWeight,
    fontSize: 14,
  },
  arrow: {
    fontSize: 12,
    marginLeft: STYLES.spacing.sm,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  dropdown: {
    backgroundColor: COLORS.white,
    borderRadius: STYLES.borderRadius.medium,
    maxHeight: 200,
    ...STYLES.shadow,
    elevation: 5,
  },
  optionsList: {
    flexGrow: 0,
  },
  option: {
    paddingHorizontal: STYLES.spacing.md,
    paddingVertical: STYLES.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.textfield,
  },
  lastOption: {
    borderBottomWidth: 0,
  },
  optionText: {
    fontSize: 10,
    fontWeight: FONTS.hintText.fontWeight,
    color: FONTS.commonText.color,
  },
});

export default DropField;
