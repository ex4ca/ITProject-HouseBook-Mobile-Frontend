import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Briefcase, User } from "lucide-react-native";
import { PALETTE } from "../styles/palette";
import { globalStyles } from "../styles/globalStyles";

// The JobBoard is the main screen for the "Jobs" tab.
import JobBoard from "../screens/tradie/JobBoard";
import Account from "../screens/profile/Account";

/**
 * Creates a new BottomTabNavigator instance.
 */
const Tab = createBottomTabNavigator();

/**
 * A bottom tab navigator tailored for the "Tradie" user role.
 *
 * This component establishes the primary tabbed interface for a tradie,
 * providing navigation between their main job board and their account
 * management screen. This is the first screen they see after logging in.
 */
function TradieTabNavigator() {
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
        name="Jobs"
        component={JobBoard} 
        options={{
          tabBarIcon: ({ color, size }) => (
            <Briefcase color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Account"
        component={Account}
        initialParams={{ userRole: "tradie" }}
        options={{
          tabBarIcon: ({ color, size }) => <User color={color} size={size} />,
        }}
      />
    </Tab.Navigator>
  );
}

export default TradieTabNavigator;