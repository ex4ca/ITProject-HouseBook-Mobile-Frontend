import React, { useState, useEffect } from 'react';
import { View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { COLORS } from './src/components/styles/constants';
import { supabase } from './src/services/supabase'; // Make sure this path is correct

// Import screens
import Login from './src/screens/auth/Login';
import SignUp from './src/screens/auth/SignUp';
import PropertyList from './src/screens/property/PropertyList';
import PropertyControlNavigator from './src/screens/property/PropertyControlNavigator';
import PropertyEdit from './src/screens/property/PropertyEdit';
import ComponentDetails from './src/screens/property/ComponentDetails';
import QRScanner from './src/screens/scanner/QRScanner';
import PinEntry from './src/screens/scanner/PinEntry';
import Account from './src/screens/profile/Account';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// --- MAP #1: For Logged-OUT Users ---
// This navigator only contains the Login and SignUp screens.
function AuthNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Login"
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="SignUp" component={SignUp} />
    </Stack.Navigator>
  );
}

// --- MAP #2: For Logged-IN Users ---
// This is your existing application structure.
function AppNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Main" // The first screen after login is the Tab Navigator
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

// Main Tab Navigator (part of the logged-in experience)
function MainTabNavigator({ route }) {
  const isOwner = route?.params?.isOwner ?? true;
  
  return (
    <Tab.Navigator
      screenOptions={{
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
      }}
    >
      <Tab.Screen 
        name="Properties"
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <PropertiesIcon color={color} size={size} focused={focused} />
          ),
        }}
      >
        {(props) => <PropertyList {...props} isOwner={isOwner} />}
      </Tab.Screen>
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

// Icon components (no changes needed here)
const PropertiesIcon = ({ color, size, focused }) => (
    <View style={{ width: size + 10, height: size + 10, backgroundColor: focused ? COLORS.primary : COLORS.textfield, borderRadius: (size + 10) / 2, justifyContent: 'center', alignItems: 'center' }}><View style={{ width: size - 8, height: size - 8, backgroundColor: focused ? COLORS.white : COLORS.black, borderRadius: 4 }} /></View>
);
const AccountIcon = ({ color, size, focused }) => (
    <View style={{ width: size + 10, height: size + 10, backgroundColor: focused ? COLORS.primary : COLORS.textfield, borderRadius: (size + 10) / 2, justifyContent: 'center', alignItems: 'center' }}><View style={{ width: size - 8, height: size - 8, backgroundColor: focused ? COLORS.white : COLORS.black, borderRadius: (size - 8) / 2 }} /></View>
);


// --- THE MAIN APP COMPONENT & TRAFFIC CONTROLLER ---
export default function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for an existing session when the app starts
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Listen for auth changes (SIGN_IN, SIGN_OUT)
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    // Cleanup the listener
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
      {/* This is the traffic controller. It shows the correct map based on login status. */}
      {session && session.user ? <AppNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
}

