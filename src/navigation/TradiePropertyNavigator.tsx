import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useRoute } from '@react-navigation/native';
import { Layout, LayoutGrid } from 'lucide-react-native';
import { PALETTE } from '../styles/palette';
import { globalStyles } from '../styles/globalStyles';

// Import the two screens that will be used in the tabs
import TradiePropertyGeneral from '../screens/tradie/TradiePropertyGeneral';
import TradiePropertyDetails from '../screens/tradie/TradiePropertyDetails';

const Tab = createBottomTabNavigator();

/**
 * This navigator creates a tabbed interface for a tradie viewing a specific property.
 * It's displayed after a tradie selects a job from their job board.
 */
export default function TradiePropertyNavigator() {
  const route = useRoute();
  // Receive propertyId and jobId from the previous screen (JobBoard)
  const { propertyId, jobId } = route.params as { propertyId: string; jobId: string };

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
        name="Details"
        component={TradiePropertyDetails}
        // Pass the necessary IDs down to the Details screen
        initialParams={{ propertyId, jobId }}
        options={{
          tabBarIcon: ({ color, size }) => <LayoutGrid color={color} size={size} />,
        }}
      />
    </Tab.Navigator>
  );
}
