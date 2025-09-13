import React, { useState, useRef } from 'react';
import {
  TouchableOpacity,
  Text,
  View,
  StyleSheet,
  Modal,
  FlatList,
  SafeAreaView,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { ChevronsUpDown } from 'lucide-react-native';

import { PALETTE } from '../styles/palette';
import { STYLES } from '../styles/globalStyles';

// Defines the shape of the props that this component accepts.
interface DropFieldProps {
  options: string[];
  placeholder?: string;
  selectedValue?: string;
  onSelect: (option: string) => void;
  style?: ViewStyle | ViewStyle[];
  textStyle?: TextStyle | TextStyle[];
  disabled?: boolean;
}

const DropField = ({
  options = [],
  placeholder = 'Select an option',
  selectedValue,
  onSelect,
  style = {},
  textStyle = {},
  disabled = false,
}: DropFieldProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ x: 0, y: 0, width: 0 });
  const dropdownRef = useRef<TouchableOpacity>(null);

  const toggleDropdown = () => {
    if (disabled) return;
    
    if (isOpen) {
      setIsOpen(false);
    } else {
      dropdownRef.current?.measure((x, y, width, height, pageX, pageY) => {
        setDropdownPosition({
          x: pageX,
          y: pageY + height,
          width: width,
        });
        setIsOpen(true);
      });
    }
  };

  const selectOption = (option: string) => {
    onSelect(option);
    setIsOpen(false);
  };

  const displayText = selectedValue || placeholder;
  const isPlaceholder = !selectedValue;

  const containerStyles = [
    styles.container,
    style,
    disabled && styles.disabledContainer,
  ];

  const textStyles = [
    styles.text,
    isPlaceholder && styles.placeholderText,
    textStyle,
  ];

  const renderOption = ({ item, index }: { item: string; index: number }) => (
    <TouchableOpacity
      style={[
        styles.option,
        index === options.length - 1 && styles.lastOption
      ]}
      onPress={() => selectOption(item)}
    >
      <Text style={styles.optionText}>{item}</Text>
    </TouchableOpacity>
  );

  return (
    <View>
      <TouchableOpacity
        ref={dropdownRef}
        style={containerStyles}
        onPress={toggleDropdown}
        disabled={disabled}
      >
        <Text style={textStyles} numberOfLines={1}>
          {displayText}
        </Text>
        <ChevronsUpDown size={20} color={PALETTE.textSecondary} />
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
          <SafeAreaView>
            <View 
              style={[
                styles.dropdown, 
                {
                  top: dropdownPosition.y,
                  left: dropdownPosition.x,
                  width: dropdownPosition.width,
                }
              ]}
            >
              <FlatList
                data={options}
                renderItem={renderOption}
                keyExtractor={(item, index) => index.toString()}
                showsVerticalScrollIndicator={false}
              />
            </View>
          </SafeAreaView>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: PALETTE.card,
    borderRadius: STYLES.borderRadius.small,
    paddingHorizontal: STYLES.spacing.md,
    height: 58,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: PALETTE.border,
  },
  disabledContainer: {
    backgroundColor: PALETTE.background,
  },
  text: {
    flex: 1,
    fontSize: 16,
    color: PALETTE.textPrimary,
  },
  placeholderText: {
    color: PALETTE.textSecondary,
  },
  modalOverlay: {
    flex: 1,
  },
  dropdown: {
    position: 'absolute',
    backgroundColor: PALETTE.card,
    borderRadius: STYLES.borderRadius.medium,
    maxHeight: 220,
    borderWidth: 1,
    borderColor: PALETTE.border,
    ...STYLES.shadow,
  },
  option: {
    paddingHorizontal: STYLES.spacing.md,
    paddingVertical: STYLES.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: PALETTE.border,
  },
  lastOption: {
    borderBottomWidth: 0,
  },
  optionText: {
    fontSize: 16,
    color: PALETTE.textPrimary,
  },
});

export default DropField;