// Style constants for the Housebook app

// Font styles
export const FONTS = {
  title: {
    color: '#37352F',
    opacity: 1,
    fontWeight: 'bold',
    fontSize: 36,
  },
  commonText: {
    color: '#000000',
    opacity: 0.8,
    fontWeight: '600', // semibold
    fontSize: 24,
  },
  highlightText: {
    color: '#FFFFFF',
    opacity: 1,
    fontWeight: 'bold',
    fontSize: 20,
  },
  hintText: {
    color: '#000000',
    opacity: 0.5,
    fontWeight: 'bold',
    fontSize: 20,
  },
  smallText: {
    color: '#000000',
    opacity: 1,
    fontWeight: 'bold',
    fontSize: 12,
  },
  screenTitle: {
    color: '#37352F',
    opacity: 1,
    fontWeight: 'bold',
    fontSize: 28,
  },
};

// Colors
export const COLORS = {
  white: '#FFFFFF',
  black: '#37352F',
  primary: '#4FA0BA',
  primary2: '#74C7D8',
  secondary: '#E1FFF1',
  terciary: '#F9FBCB',
  textfield: '#F5F5F5',
  statusConfirmContent: '#00FF22',
  statusConfirmStroke: '#00C71A',
  statusPendingContent: '#FFEE00',
  statusPendingStroke: '#B1A500',
};

// Common styling helpers
export const STYLES = {
  // Shadow effect for components
  shadow: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  // Border radius for components
  borderRadius: {
    small: 8,
    medium: 12,
    large: 16,
  },
  // Common spacing
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    xxl: 32,
  },
};
