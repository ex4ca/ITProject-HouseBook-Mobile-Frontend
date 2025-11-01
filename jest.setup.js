// Ensure React Native code that references __DEV__ can run in Jest environment
global.__DEV__ = true;

// Load jest-native matchers after __DEV__ is set
require('@testing-library/jest-native/extend-expect');

// Minimal mocks for native modules used in components
jest.mock('react-native-safe-area-context', () => {
  const React = require('react');
  return {
    SafeAreaView: ({ children, ...props }) => React.createElement('div', props, children),
    SafeAreaProvider: ({ children }) => children,
    useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
  };
});
// Do not mock 'react-native' here; let the jest preset and environment handle it.

// Mock lucide icons to simple components so imports do not require native modules
jest.mock('lucide-react-native', () => {
  const React = require('react');
  const Dummy = ({ children, ...props }) => React.createElement('span', props, children);
  return {
    __esModule: true,
    ChevronDown: Dummy,
    ChevronRight: Dummy,
    ChevronLeft: Dummy,
    PlusCircle: Dummy,
    X: Dummy,
    Trash2: Dummy,
  };
});

// Mock react-native-svg used by lucide or other libs
jest.mock('react-native-svg', () => {
  const React = require('react');
  const Svg = ({ children, ...props }) => React.createElement('svg', props, children);
  const Path = (props) => React.createElement('path', props, null);
  return { Svg, Path, Circle: 'circle', Rect: 'rect' };
});

// Some style modules reference StyleSheet; mock palette and globalStyles to simple objects
jest.mock('<rootDir>/src/styles/palette', () => ({
  PALETTE: {
    primary: '#007AFF',
    primaryForeground: '#fff',
    textPrimary: '#000',
    textSecondary: '#666',
    card: '#fff',
    border: '#e0e0e0',
    danger: '#ff3b30',
    dangerBackground: '#fff1f0',
    background: '#f7f7f7'
  }
}), { virtual: true });

jest.mock('<rootDir>/src/styles/globalStyles', () => ({
  STYLES: { borderRadius: { medium: 8 } }
}), { virtual: true });

jest.mock('<rootDir>/src/styles/propertyDetailsStyles', () => ({
  propertyDetailsStyles: {
    specificationsBox: {},
    specPair: {},
    specKey: {},
    specValue: {},
    assetContainer: {},
    assetHeader: {},
    assetContent: {},
    assetTitle: {},
    contentSectionTitle: {},
    addButtonSmall: {},
    addButtonSmallText: {},
    emptyText: {},
    historySectionHeader: {},
    historyItemContainer: {},
    historyEntry: {},
    historyHeader: {},
    historyDate: {},
    historyDescription: {},
    historyAuthor: {},
    historySpecBox: {},
    modalOverlay: {},
    modalContainer: {},
    modalHeader: {},
    modalTitle: {},
    closeButton: {},
    submitButton: {},
    submitButtonText: {},
    input: {},
    label: {},
    specRow: {},
    specInputKey: {},
    specInputValue: {},
    removeRowButton: {},
    addRowButton: {},
    addRowButtonText: {},
    container: {},
    scrollContainer: {},
    centerContainer: {},
    header: {},
    backButton: {},
    dropdownContainer: {},
    sortModeButton: {},
    sortModeButtonText: {},
    pageTitle: {},
    contentContainer: {},
    headerActions: {},
    addButton: {},
    addButtonText: {},
  }
}), { virtual: true });

