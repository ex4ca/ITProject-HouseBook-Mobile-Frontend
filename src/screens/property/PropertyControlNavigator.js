import React from 'react';
import { View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { COLORS, STYLES } from '../../components/styles/constants';

// Import the property screens
import PropertyGeneral from './PropertyGeneral';
import PropertyDetails from './PropertyDetails';
import Role from './Role';

const Tab = createBottomTabNavigator();

// Property Control Navigator with 3 tabs
function PropertyControlNavigator({ route }) {
  // --- FIX APPLIED HERE ---
  // We now correctly receive the 'propertyId' passed from the PropertyList screen.
  const { propertyId, isOwner } = route.params || {};

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarStyle: {
          backgroundColor: COLORS.white,
          borderTopWidth: 1,
          borderTopColor: COLORS.textfield,
          height: 80,
          paddingBottom: 10,
          paddingTop: 10,
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.black,
        tabBarItemStyle: {
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
        },
        tabBarLabelStyle: {
          display: 'none', // Hide text labels
        },
        headerShown: false,
      })}
    >
      {/* Each screen now receives the 'propertyId' so it can fetch its own data */}
      <Tab.Screen 
        name="General"
        component={PropertyGeneral}
        initialParams={{ propertyId: propertyId }}
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <GeneralIcon color={color} size={size} focused={focused} />
          ),
        }}
      />
      
      <Tab.Screen 
        name="Details"
        component={PropertyDetails}
        initialParams={{ propertyId: propertyId }}
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <DetailsIcon color={color} size={size} focused={focused} />
          ),
        }}
      />
      
      <Tab.Screen 
        name="Authority"
        component={Role}
        initialParams={{ propertyId: propertyId, isOwner: isOwner }}
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <AuthorityIcon color={color} size={size} focused={focused} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

// Icon components for property control tabs
const GeneralIcon = ({ color, size, focused }) => (
  <View style={{ 
    width: size + 10, 
    height: size + 10, 
    backgroundColor: focused ? COLORS.primary : COLORS.textfield,
    borderRadius: (size + 10) / 2,
    justifyContent: 'center',
    alignItems: 'center',
  }}>
    <View style={{ 
      width: size - 8, 
      height: size - 8, 
      backgroundColor: focused ? COLORS.white : COLORS.black,
      borderRadius: 4,
    }} />
  </View>
);

const DetailsIcon = ({ color, size, focused }) => (
  <View style={{ 
    width: size + 10, 
    height: size + 10, 
    backgroundColor: focused ? COLORS.primary : COLORS.textfield,
    borderRadius: (size + 10) / 2,
    justifyContent: 'center',
    alignItems: 'center',
  }}>
    <View style={{ 
      width: size - 8, 
      height: size - 8, 
      backgroundColor: focused ? COLORS.white : COLORS.black,
      borderRadius: 2,
    }} />
  </View>
);

const AuthorityIcon = ({ color, size, focused }) => (
  <View style={{ 
    width: size + 10, 
    height: size + 10, 
    backgroundColor: focused ? COLORS.primary : COLORS.textfield,
    borderRadius: (size + 10) / 2,
    justifyContent: 'center',
    alignItems: 'center',
  }}>
    <View style={{ 
      width: size - 8, 
      height: size - 8, 
      backgroundColor: focused ? COLORS.white : COLORS.black,
      borderRadius: (size - 8) / 2,
    }} />
  </View>
);

export default PropertyControlNavigator;
