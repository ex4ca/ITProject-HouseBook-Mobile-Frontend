import React, { useState, useEffect } from 'react';
import { View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { COLORS } from './src/components/styles/constants';
import { supabase } from './src/api/supabaseClient';

// Import screens
import AuthScreen from './src/screens/auth/AuthScreen';
import PropertyList from './src/screens/property/PropertyList';
import PropertyControlNavigator from './src/screens/property/PropertyControlNavigator';
import PropertyEdit from './src/screens/property/PropertyEdit';
import ComponentDetails from './src/screens/property/ComponentDetails';
import QRScanner from './src/screens/scanner/QRScanner';
import PinEntry from './src/screens/scanner/PinEntry';
import Account from './src/screens/profile/Account';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Handles the authentication flow for users who are not logged in.
function AuthNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Auth" component={AuthScreen} />
    </Stack.Navigator>
  );
}

// Icon components
const PropertiesIcon = ({ color, size, focused }) => (
    <View style={{ width: size + 10, height: size + 10, backgroundColor: focused ? COLORS.primary : COLORS.textfield, borderRadius: (size + 10) / 2, justifyContent: 'center', alignItems: 'center' }}><View style={{ width: size - 8, height: size - 8, backgroundColor: focused ? COLORS.white : COLORS.black, borderRadius: 4 }} /></View>
);
const AccountIcon = ({ color, size, focused }) => (
    <View style={{ width: size + 10, height: size + 10, backgroundColor: focused ? COLORS.primary : COLORS.textfield, borderRadius: (size + 10) / 2, justifyContent: 'center', alignItems: 'center' }}><View style={{ width: size - 8, height: size - 8, backgroundColor: focused ? COLORS.white : COLORS.black, borderRadius: (size - 8) / 2 }} /></View>
);

// Common screen options for the tab navigators
const tabNavigatorScreenOptions = {
  tabBarStyle: {
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.textfield,
    height: 80,
    paddingBottom: 10,
    paddingTop: 10,
  },
  tabBarActiveTintColor: COLORS.primary,
  tabBarInactiveTintColor: COLORS.black,
  tabBarItemStyle: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabBarLabelStyle: {
    display: 'none',
  },
  headerShown: false,
};


// Navigators for authenticated users, split by role.

// The set of tabs and screens for property owners.
function OwnerTabNavigator() {
  return (
    <Tab.Navigator screenOptions={tabNavigatorScreenOptions}>
      <Tab.Screen 
        name="Properties"
        component={PropertyList}
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <PropertiesIcon color={color} size={size} focused={focused} />
          ),
        }}
      />
      <Tab.Screen 
        name="Account" 
        component={Account}
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <AccountIcon color={color} size={size} focused={focused} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

// The set of tabs and screens for tradies.
function TradieTabNavigator() {
  return (
    <Tab.Navigator screenOptions={tabNavigatorScreenOptions}>
      <Tab.Screen 
        name="JobBoard" // A different starting screen for tradies
        component={PropertyList} // Replace with your JobBoardScreen later
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <PropertiesIcon color={color} size={size} focused={focused} /> // Replace with a "Jobs" icon
          ),
        }}
      />
      <Tab.Screen 
        name="Account" 
        component={Account}
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <AccountIcon color={color} size={size} focused={focused} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}


// This stack contains all post-login screens and uses the correct tab navigator.
function AppNavigator({ userRole }) {
  const MainTabNavigator = userRole === 'owner' ? OwnerTabNavigator : TradieTabNavigator;

  return (
    <Stack.Navigator
      initialRouteName="Main"
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="Main" component={MainTabNavigator} />
      <Stack.Screen name="Scanner" component={QRScanner} />
      <Stack.Screen name="PinEntry" component={PinEntry} />
      <Stack.Screen name="PropertyDetails" component={PropertyControlNavigator} />
      <Stack.Screen name="PropertyEdit" component={PropertyEdit} />
      <Stack.Screen name="ComponentDetails" component={ComponentDetails} />
    </Stack.Navigator>
  );
}


// The root component that determines which navigator to show.
export default function App() {
  const [session, setSession] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  // Function to fetch the user role from the database
  const fetchUserRole = async (user) => {
    if (!user) return null;

    // Check the Owner table first
    const { data: ownerData } = await supabase
      .from('Owner')
      .select('user_id')
      .eq('user_id', user.id)
      .single();

    if (ownerData) {
      return 'owner';
    }

    // If not an owner, check the Tradesperson table
    const { data: tradieData } = await supabase
      .from('Tradesperson')
      .select('user_id')
      .eq('user_id', user.id)
      .single();

    if (tradieData) {
      return 'tradie';
    }
    
    // Default or handle cases where user has no role
    return null; 
  };


  useEffect(() => {
    const initializeApp = async () => {
      // Check for existing session on app start
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      if (session) {
        const role = await fetchUserRole(session.user);
        setUserRole(role);
      }
      setLoading(false);
    };

    initializeApp();

    // Listen for auth state changes (sign in, sign out)
    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      if (session) {
        const role = await fetchUserRole(session.user);
        setUserRole(role);
      } else {
        // Clear role on sign out
        setUserRole(null);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return null; // Or a loading screen
  }

  return (
    <NavigationContainer>
      <StatusBar style="auto" />
      {session && session.user && userRole ? (
        <AppNavigator userRole={userRole} />
      ) : (
        <AuthNavigator />
      )}
    </NavigationContainer>
  );
}

