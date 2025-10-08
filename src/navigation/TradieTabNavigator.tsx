import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Briefcase, User } from "lucide-react-native";
import { PALETTE } from "../styles/palette";
import { globalStyles } from "../styles/globalStyles";

import JobBoard from "../screens/tradie/JobBoard";
import Account from "../screens/profile/Account";

const Tab = createBottomTabNavigator();

// The Tradie's specific tab navigator.
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
