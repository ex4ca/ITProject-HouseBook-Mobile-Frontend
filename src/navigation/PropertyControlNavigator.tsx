import React from 'react';
import { View, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { RouteProp } from '@react-navigation/native';
import { Info, LayoutGrid, Users, Bell } from 'lucide-react-native';

// Import types for navigation
import type { RootStackParamList, PropertyControlTabParamList } from './types';

// Import styles and screens
import { PALETTE } from '../styles/palette';
import { globalStyles } from '../styles/globalStyles';
import PropertyGeneral from '../screens/property/PropertyGeneral';
import PropertyDetails from '../screens/property/PropertyDetails';
import PropertyRequestsScreen from '../screens/property/PropertyRequest';
import Role from '../screens/property/Role';

const Tab = createBottomTabNavigator<PropertyControlTabParamList>();

// Define the type for the route props passed to this navigator.
type PropertyControlNavigatorRouteProp = RouteProp<RootStackParamList, 'PropertyDetails'>;
type Props = {
  route: PropertyControlNavigatorRouteProp;
};

// This Tab Navigator displays details for a single property.
const PropertyControlNavigator = ({ route }: Props) => {
  // Receives propertyId and isOwner from the navigation route params.
  const { propertyId, isOwner } = route.params;

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: PALETTE.primary,
        tabBarInactiveTintColor: PALETTE.textSecondary,
        tabBarStyle: globalStyles.tabBar,
        tabBarLabelStyle: globalStyles.tabBarLabel,
      }}
    >
      <Tab.Screen 
        name="General"
        component={PropertyGeneral}
        initialParams={{ propertyId }}
        options={{
          tabBarIcon: ({ color, size }) => <Info color={color} size={size} />,
        }}
      />
      
      <Tab.Screen 
        name="Details"
        component={PropertyDetails}
        initialParams={{ propertyId, isOwner }}
        options={{
          tabBarIcon: ({ color, size }) => <LayoutGrid color={color} size={size} />,
        }}
      />
      
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

export default PropertyControlNavigator;