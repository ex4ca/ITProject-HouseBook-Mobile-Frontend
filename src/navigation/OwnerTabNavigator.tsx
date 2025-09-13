import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Home, User } from 'lucide-react-native';
import { PALETTE } from '../styles/pallete'
import { globalStyles } from '../styles/globalStyles';

// Screens
import PropertyList from '../screens/property/PropertyList';
import Account from '../screens/profile/Account';

const Tab = createBottomTabNavigator();

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
        options={{
          tabBarIcon: ({ color, size }) => <User color={color} size={size} />,
        }}
      />
    </Tab.Navigator>
  );
}

export default OwnerTabNavigator;
