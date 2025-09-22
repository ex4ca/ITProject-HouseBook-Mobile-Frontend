import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import { supabase } from './src/config/supabaseClient';
import type { Session, User } from '@supabase/supabase-js';
import type { UserRole } from './src/types/index';

// Navigators
import AppNavigator from './src/navigation/AppNavigator';

// Screens
import AuthScreen from './src/screens/auth/AuthScreen';

const Stack = createStackNavigator();

// Handles the authentication flow for unauthenticated users.
function AuthNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Auth" component={AuthScreen} />
    </Stack.Navigator>
  );
}

// The root component of the application.
export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // This function checks the database to determine if a user is an 'owner' or 'tradie'.
  const fetchUserRole = async (user: User): Promise<UserRole | null> => {
    // Check the Owner table first.
    const { count: ownerCount, error: ownerError } = await supabase
      .from('Owner')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);

    if (ownerError) {
      console.error("Error checking owner table:", ownerError);
      return null;
    }
    if (ownerCount && ownerCount > 0) {
      return 'owner';
    }

    // If not an owner, check the Tradesperson table.
    const { count: tradieCount, error: tradieError } = await supabase
      .from('Tradesperson')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);

    if (tradieError) {
      console.error("Error checking tradie table:", tradieError);
      return null;
    }
    if (tradieCount && tradieCount > 0) {
      return 'tradie';
    }

    return null;
  };

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const fetchRoleAndSetLoading = async () => {
      if (session?.user) {
        const role = await fetchUserRole(session.user);
        setUserRole(role);
      } else {
        setUserRole(null);
      }
      setLoading(false);
    };

    fetchRoleAndSetLoading();
  }, [session]); 

  if (loading) {
    return null;
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