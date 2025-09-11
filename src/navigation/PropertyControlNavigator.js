import React from 'react';
import { View, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Info, LayoutGrid, Users, Bell } from 'lucide-react-native';

// Import all the necessary screens for the tabs
import PropertyGeneralScreen from '../screens/property/PropertyGeneral';
import PropertyDetailsScreen from '../screens/property/PropertyDetails';
import PropertyRequestsScreen from '../screens/property/PropertyRequest';
import Role from '../screens/property/Role'; // This is your Authority screen

const Tab = createBottomTabNavigator();

// Consistent color palette from other screens.
const PALETTE = {
  card: '#FFFFFF',
  textPrimary: '#111827',
  textSecondary: '#6B7280',
  primary: '#1F2937',
  border: '#E5E7EB',
};

// This Tab Navigator displays details for a single property.
function PropertyControlNavigator({ route }) {
  // Receives propertyId and isOwner from the navigation route params.
  const { propertyId, isOwner } = route.params || {};

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: PALETTE.primary,
        tabBarInactiveTintColor: PALETTE.textSecondary,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabBarLabel,
      }}
    >
      {/* Each screen receives the propertyId to fetch its own data. */}
      <Tab.Screen 
        name="General"
        component={PropertyGeneralScreen}
        initialParams={{ propertyId }}
        options={{
          tabBarIcon: ({ color, size }) => <Info color={color} size={size} />,
        }}
      />
      
      <Tab.Screen 
        name="Details"
        component={PropertyDetailsScreen}
        initialParams={{ propertyId, isOwner }}
        options={{
          tabBarIcon: ({ color, size }) => <LayoutGrid color={color} size={size} />,
        }}
      />
      
      {/* The "Requests" and "Authority" tabs are only shown to the property owner. */}
      {isOwner && (
        <>
          <Tab.Screen 
            name="Requests"
            component={PropertyRequestsScreen}
            initialParams={{ propertyId }}
            options={{
              tabBarIcon: ({ color, size }) => <Bell color={color} size={size} />,
            }}
          />
          <Tab.Screen 
            name="Authority"
            component={Role}
            initialParams={{ propertyId, isOwner }}
            options={{
              tabBarIcon: ({ color, size }) => <Users color={color} size={size} />,
            }}
          />
        </>
      )}
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
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

export default PropertyControlNavigator;