import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import type { UserRole } from "../types";

// Navigators
import OwnerTabNavigator from "./OwnerTabNavigator";
import TradieTabNavigator from "./TradieTabNavigator";
import PropertyControlNavigator from "./PropertyControlNavigator";

// Import the new navigator for the tradie's property hub
import TradiePropertyNavigator from "./TradiePropertyNavigator"; 

// Screens
import ComponentDetails from "../screens/property/ComponentDetails";
import PropertyRequestsScreen from "../screens/property/PropertyRequest";
import PropertyPin from "../screens/property/PropertyPin";
import QRScannerScreen from '../screens/scanner/QRScannerScreen';
import PinEntryScreen from '../screens/tradie/PinEntryScreen'; 

const Stack = createStackNavigator();

type AppNavigatorProps = {
  userRole: UserRole;
};

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
      
      <Stack.Screen
        name="PinEntryScreen"
        component={PinEntryScreen}
        options={{ headerShown: true, title: 'Enter Job PIN' }}
      />

      {/* This is the new, correct entry for the tradie's entire property hub */}
      <Stack.Screen
        name="TradiePropertyHub"
        component={TradiePropertyNavigator}
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