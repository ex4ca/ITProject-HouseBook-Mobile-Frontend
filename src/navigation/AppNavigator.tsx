import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import type { UserRole } from '../types';

// Navigators
import OwnerTabNavigator from './OwnerTabNavigator';
import TradieTabNavigator from './TradieTabNavigator';
import PropertyControlNavigator from './PropertyControlNavigator';

// Screens
import ComponentDetails from '../screens/property/ComponentDetails';
import QRScanner from '../screens/scanner/QRScanner';
import PinEntry from '../screens/scanner/PinEntry';

const Stack = createStackNavigator();

// Define the props for the AppNavigator component.
type AppNavigatorProps = {
  userRole: UserRole;
};

// Main stack navigator for all post-login screens.
function AppNavigator({ userRole }: AppNavigatorProps) {
  const MainTabNavigator = userRole === 'owner' ? OwnerTabNavigator : TradieTabNavigator;

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Main" component={MainTabNavigator} />
      <Stack.Screen name="Scanner" component={QRScanner} />
      <Stack.Screen name="PinEntry" component={PinEntry} />
      <Stack.Screen name="PropertyDetails" component={PropertyControlNavigator} />
      <Stack.Screen name="ComponentDetails" component={ComponentDetails} />
    </Stack.Navigator>
  );
}

export default AppNavigator;
