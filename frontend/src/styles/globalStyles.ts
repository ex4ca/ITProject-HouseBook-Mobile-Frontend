import { StyleSheet } from 'react-native';
import { PALETTE } from './palette'; 

// This file holds reusable StyleSheet objects and constants for common patterns
// like shadows, spacing, and border radius, making the design consistent.
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
  // Common spacing values
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    xxl: 32,
  },
};

// Contains StyleSheet objects that can be shared across multiple components.
export const globalStyles = StyleSheet.create({
  tabBar: {
    backgroundColor: PALETTE.card,
    borderTopWidth: 1,
    borderTopColor: PALETTE.border,
    height: 90,
    paddingTop: 10,
    paddingBottom: 30,
  },
  tabBarLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 4,
  },
});

