import { View, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Info, LayoutGrid, Users } from 'lucide-react-native';

// Import the screens for the tabs
import PropertyGeneral from '../screens/property/PropertyGeneral';
import PropertyDetails from '../screens/property/PropertyDetails';
import Role from '../screens/property/Role';

const Tab = createBottomTabNavigator();

// Consistent color palette from other screens.
const PALETTE = {
  card: '#FFFFFF',
  textPrimary: '#111827',
  textSecondary: '#6B7280',
  primary: '#1F2937',
  border: '#E5E7EB',
};

// This Tab Navigator displays details for a single property.
function PropertyControlNavigator({ route }) {
  // Receives propertyId and isOwner from the navigation route params.
  const { propertyId, isOwner } = route.params || {};

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: PALETTE.primary,
        tabBarInactiveTintColor: PALETTE.textSecondary,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarIndicatorStyle: styles.tabBarIndicator,
      }}
    >
      {/* Each screen receives the propertyId to fetch its own data. */}
      <Tab.Screen 
        name="General"
        component={PropertyGeneral}
        initialParams={{ propertyId }}
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <View style={styles.tabIconContainer}>
              {focused && <View style={styles.activeIndicator} />}
              <Info color={color} size={size} />
            </View>
          ),
        }}
      />
      
      <Tab.Screen 
        name="Details"
        component={PropertyDetails}
        initialParams={{ propertyId }}
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <View style={styles.tabIconContainer}>
              {focused && <View style={styles.activeIndicator} />}
              <LayoutGrid color={color} size={size} />
            </View>
          ),
        }}
      />
      
      <Tab.Screen 
        name="Authority"
        component={Role}
        initialParams={{ propertyId, isOwner }}
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <View style={styles.tabIconContainer}>
              {focused && <View style={styles.activeIndicator} />}
              <Users color={color} size={size} />
            </View>
          ),
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: PALETTE.card,
    borderTopWidth: 1,
    borderTopColor: PALETTE.border,
    height: 90,
    paddingTop: 10,
    paddingBottom: 30,
  },
  tabBarLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 4,
  },
  tabIconContainer: {
    alignItems: 'center',
    width: '100%',
  },
  activeIndicator: {
    position: 'absolute',
    top: -11, // Position it right above the icon, aligning with the tab bar's top border.
    height: 2,
    width: 40,
    backgroundColor: PALETTE.primary,
  },
});

export default PropertyControlNavigator;
