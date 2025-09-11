import React, { useState, useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { Home, User, Briefcase } from 'lucide-react-native';
import { supabase } from './src/api/supabaseClient';

// Screen imports
import AuthScreen from './src/screens/auth/AuthScreen';
import PropertyList from './src/screens/property/PropertyList';
import PropertyControlNavigator from './src/navigation/PropertyControlNavigator';
import PropertyEdit from './src/screens/property/PropertyEdit';
import ComponentDetails from './src/screens/property/ComponentDetails';
import QRScanner from './src/screens/scanner/QRScanner';
import PinEntry from './src/screens/scanner/PinEntry';
import Account from './src/screens/profile/Account';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Defines a consistent, clean color scheme for the app.
const PALETTE = {
  background: '#FFFFFF',
  card: '#FFFFFF',
  textPrimary: '#111827',
  textSecondary: '#6B7280',
  primary: '#111827',
  border: '#E5E7EB',
};

// Handles the authentication flow for unauthenticated users.
function AuthNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Auth" component={AuthScreen} />
    </Stack.Navigator>
  );
}

// Navigators for authenticated users, split by role.

// Owner-specific tab navigator.
function OwnerTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: PALETTE.primary,
        tabBarInactiveTintColor: PALETTE.textSecondary,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabBarLabel,
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

// Tradie-specific tab navigator.
function TradieTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: PALETTE.primary,
        tabBarInactiveTintColor: PALETTE.textSecondary,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabBarLabel,
      }}
    >
      <Tab.Screen 
        name="Jobs"
        component={PropertyList} // Placeholder: Replace with a JobBoardScreen
        options={{
          tabBarIcon: ({ color, size }) => <Briefcase color={color} size={size} />,
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

// Stack navigator for all post-login screens.
function AppNavigator({ userRole }) {
  const MainTabNavigator = userRole === 'owner' ? OwnerTabNavigator : TradieTabNavigator;

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Main" component={MainTabNavigator} />
      <Stack.Screen name="Scanner" component={QRScanner} />
      <Stack.Screen name="PinEntry" component={PinEntry} />
      <Stack.Screen name="PropertyDetails" component={PropertyControlNavigator} />
      <Stack.Screen name="PropertyEdit" component={PropertyEdit} />
      <Stack.Screen name="ComponentDetails" component={ComponentDetails} />
    </Stack.Navigator>
  );
}

// Root component: manages auth state and navigators.
export default function App() {
  const [session, setSession] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUserRole = async (user) => {
    if (!user) return null;
    
    // Check if the user is in the Owner table.
    const { data: ownerData } = await supabase
      .from('Owner')
      .select('user_id', { count: 'exact' })
      .eq('user_id', user.id);

    if (ownerData && ownerData.length > 0) {
      return 'owner';
    }

    // Check if the user is in the Tradesperson table.
    const { data: tradieData } = await supabase
      .from('Tradesperson')
      .select('user_id', { count: 'exact' })
      .eq('user_id', user.id);

    if (tradieData && tradieData.length > 0) {
      return 'tradie';
    }
    
    return null; 
  };

  useEffect(() => {
    const initializeApp = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      if (session) {
        const role = await fetchUserRole(session.user);
        setUserRole(role);
      }
      setLoading(false);
    };

    initializeApp();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      if (session) {
        const role = await fetchUserRole(session.user);
        setUserRole(role);
      } else {
        setUserRole(null);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return null; // Render a splash screen or loading indicator here.
  }

  return (
    <NavigationContainer>
      <StatusBar style="dark" />
      {session && session.user && userRole ? (
        <AppNavigator userRole={userRole} />
      ) : (
        <AuthNavigator />
      )}
    </NavigationContainer>
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
});