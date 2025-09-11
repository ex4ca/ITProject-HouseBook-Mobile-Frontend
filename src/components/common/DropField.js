import { useState, useRef } from 'react';
import { TouchableOpacity, Text, View, StyleSheet, Modal, FlatList, SafeAreaView } from 'react-native';
import { ChevronsUpDown } from 'lucide-react-native';

// Consistent color palette for the Notion-like design.
const PALETTE = {
  background: '#F8F9FA',
  card: '#FFFFFF',
  textPrimary: '#111827',
  textSecondary: '#6B7280',
  primary: '#111827',
  border: '#E5E7EB',
};

const DropField = ({
  options = [],
  placeholder = 'Select an option',
  selectedValue,
  onSelect,
  style = {},
  textStyle = {},
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ x: 0, y: 0, width: 0 });
  const dropdownRef = useRef(null);

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

  const selectOption = (option) => {
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

  const renderOption = ({ item, index }) => (
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
    borderRadius: 8,
    paddingHorizontal: 16,
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
    borderRadius: 8,
    maxHeight: 220,
    borderWidth: 1,
    borderColor: PALETTE.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  option: {
    paddingHorizontal: 16,
    paddingVertical: 16,
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