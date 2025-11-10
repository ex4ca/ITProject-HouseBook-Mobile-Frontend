import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useRoute } from "@react-navigation/native";
import { Layout, List, Bell } from "lucide-react-native";
import { PALETTE } from "../styles/palette";
import { globalStyles } from "../styles/globalStyles";

import TradiePropertyGeneral from "../screens/tradie/TradiePropertyGeneral";
import TradiePropertyDetails from "../screens/tradie/TradiePropertyDetails";
import TradieRequestsScreen from "../screens/tradie/TradieRequestsScreen";

/**
 * Creates a new BottomTabNavigator instance for this navigator.
 */
const Tab = createBottomTabNavigator();

/**
 * A bottom tab navigator for a "Tradie" user viewing a specific property/job.
 *
 * This component is typically navigated to from a job board or job list.
 * It uses the `useRoute` hook to access route parameters (`propertyId` and `jobId`)
 * and passes them down as initial parameters to its child tab screens. 
 */
export default function TradiePropertyNavigator() {
  // Access the route object to get parameters passed to this navigator.
  const route = useRoute();
  
  // Receive propertyId and jobId from the previous screen (e.g., JobBoard).
  const { propertyId, jobId } = route.params as {
    propertyId: string;
    jobId: string;
  };

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
        component={TradiePropertyGeneral}
        // Pass the necessary IDs down to the General screen
        initialParams={{ propertyId, jobId }}
        options={{
          tabBarIcon: ({ color, size }) => <Layout color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Timeline"
        component={TradiePropertyDetails}
        // Pass the necessary IDs down to the Timeline screen
        initialParams={{ propertyId, jobId }}
        options={{
          tabBarIcon: ({ color, size }) => <List color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Requests"
        component={TradieRequestsScreen}
        // Pass the necessary IDs down to the Requests screen
        initialParams={{ propertyId, jobId }}
        options={{
          tabBarIcon: ({ color, size }) => <Bell color={color} size={size} />,
        }}
      />
    </Tab.Navigator>
  );
}
