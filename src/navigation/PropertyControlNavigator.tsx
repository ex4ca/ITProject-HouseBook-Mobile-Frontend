import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { RouteProp } from "@react-navigation/native";
import { LayoutGrid, Users, Bell, Layout } from "lucide-react-native";

// Import types for navigation
import type { RootStackParamList, PropertyControlTabParamList } from "./types";

// Import styles and screens
import { PALETTE } from "../styles/palette";
import { globalStyles } from "../styles/globalStyles";
import PropertyGeneral from "../screens/property/PropertyGeneral";
import PropertyDetails from "../screens/property/PropertyDetails";
import PropertyRequestsScreen from "../screens/property/PropertyRequest";
import Role from "../screens/property/Role";

/**
 * Creates a new BottomTabNavigator instance typed with the
 * `PropertyControlTabParamList` to ensure type safety for tab routes.
 */
const Tab = createBottomTabNavigator<PropertyControlTabParamList>();

/**
 * Defines the type for the route props expected by this navigator.
 * It specifies that this component receives route params from the "PropertyDetails"
 * route defined in the `RootStackParamList`.
 */
type PropertyControlNavigatorRouteProp = RouteProp<
  RootStackParamList,
  "PropertyDetails"
>;

/**
 * Defines the shape of the props object for the PropertyControlNavigator.
 */
type Props = {
  route: PropertyControlNavigatorRouteProp;
};

/**
 * A bottom tab navigator that displays various aspects of a *single* property.
 *
 * This component acts as a nested navigator, typically pushed onto the main
 * stack. It receives a `propertyId` and an `isOwner` flag via route parameters.
 *
 * It displays "General" and "Timeline" tabs for all users.
 * If the `isOwner` flag is true, it additionally displays "Requests" and "Authority" tabs.
 */
const PropertyControlNavigator = ({ route }: Props) => {
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
          tabBarIcon: ({ color, size }) => <Layout color={color} size={size} />,
        }}
      />

      <Tab.Screen
        name="Timeline"
        component={PropertyDetails}
        initialParams={{ propertyId, isOwner }}
        options={{
          tabBarIcon: ({ color, size }) => (
            <LayoutGrid color={color} size={size} />
          ),
        }}
      />

      {isOwner && (
        <>
          <Tab.Screen
            name="Requests"
            component={PropertyRequestsScreen}
            initialParams={{ propertyId }}
            options={{
              tabBarIcon: ({ color, size }) => (
                <Bell color={color} size={size} />
              ),
            }}
          />
          <Tab.Screen
            name="Authority"
            component={Role}
            initialParams={{ propertyId, isOwner }}
            options={{
              tabBarIcon: ({ color, size }) => (
                <Users color={color} size={size} />
              ),
            }}
          />
        </>
      )}
    </Tab.Navigator>
  );
};

export default PropertyControlNavigator;
