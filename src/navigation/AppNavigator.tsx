import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import type { UserRole } from "../types";

// Navigators
import OwnerTabNavigator from "./OwnerTabNavigator";
import TradieTabNavigator from "./TradieTabNavigator";
import PropertyControlNavigator from "./PropertyControlNavigator";

// Screens
import ComponentDetails from "../screens/property/ComponentDetails";
import PropertyRequestsScreen from "../screens/property/PropertyRequest";
import PropertyPin from "../screens/property/PropertyPin";
import QRScannerScreen from '../screens/scanner/QRScannerScreen';
import TradieJobDetails from '../screens/tradie/TradieJobDetails';
import PinEntryScreen from '../screens/tradie/PinEntryScreen'; 

const Stack = createStackNavigator();

// Define the props for the AppNavigator component.
type AppNavigatorProps = {
  userRole: UserRole;
};

// Main stack navigator for all post-login screens.
function AppNavigator({ userRole }: AppNavigatorProps) {
  const MainTabNavigator =
    userRole === "owner" ? OwnerTabNavigator : TradieTabNavigator;


  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Main" component={MainTabNavigator} />
      <Stack.Screen name="PropertyRequest" component={PropertyRequestsScreen} />
      <Stack.Screen name="PropertyPin" component={PropertyPin} />
      
      <Stack.Screen 
        name="QRScannerScreen" 
        component={QRScannerScreen} 
        options={{ headerShown: true, title: 'Scan to Claim Job' }}
      />
      
      {/* Add the Pin Entry screen to the stack */}
      <Stack.Screen
        name="PinEntryScreen"
        component={PinEntryScreen}
        options={{ headerShown: true, title: 'Enter Job PIN' }}
      />

      <Stack.Screen
        name="TradieJobDetails"
        component={TradieJobDetails}
        options={{ headerShown: true, title: 'Job Details' }}
      />

      <Stack.Screen
        name="PropertyDetails"
        component={PropertyControlNavigator}
      />
      <Stack.Screen name="ComponentDetails" component={ComponentDetails} />
    </Stack.Navigator>
  );
}

export default AppNavigator;