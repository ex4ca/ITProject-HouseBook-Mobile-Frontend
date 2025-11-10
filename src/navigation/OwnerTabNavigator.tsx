import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Home, User } from "lucide-react-native";
import { PALETTE } from "../styles/palette";
import { globalStyles } from "../styles/globalStyles";

// Screens
import PropertyList from "../screens/property/PropertyList";
import Account from "../screens/profile/Account";

/**
 * Creates a new BottomTabNavigator instance.
 */
const Tab = createBottomTabNavigator();

/**
 * A bottom tab navigator tailored for the "Owner" user role.
 *
 * This component establishes the primary tabbed interface for an owner,
 * providing navigation between their list of properties and their
 * account management screen.
 *
 */
function OwnerTabNavigator() {
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
        name="Properties"
        component={PropertyList}
        options={{
          tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Account"
        component={Account}
        initialParams={{ userRole: "owner" }}
        options={{
          tabBarIcon: ({ color, size }) => <User color={color} size={size} />,
        }}
      />
    </Tab.Navigator>
  );
}

export default OwnerTabNavigator;
