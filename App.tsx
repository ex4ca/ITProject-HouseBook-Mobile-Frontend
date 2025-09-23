import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import { supabase } from './src/config/supabaseClient';
import type { Session, User } from '@supabase/supabase-js';
import type { UserRole } from './src/types';

// Navigators
import AppNavigator from './src/navigation/AppNavigator';
// Screens
import AuthScreen from './src/screens/auth/AuthScreen';

const Stack = createStackNavigator();

function AuthNavigator({ onSuccessfulLogin }: { onSuccessfulLogin: (role: UserRole) => void }) {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Auth">
        {(props) => <AuthScreen {...props} onSuccessfulLogin={onSuccessfulLogin} />}
      </Stack.Screen>
    </Stack.Navigator>
  );
}

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setLoading(false);
    };
    
    getInitialSession();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (!session) {
        setUserRole(null);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleSuccessfulLogin = (role: UserRole) => {
    setUserRole(role);
  };

  if (loading) {
    return null;
  }

  return (
    <NavigationContainer>
      <StatusBar style="dark" />
      {session && session.user && userRole ? (
        <AppNavigator userRole={userRole} />
      ) : (
        <AuthNavigator onSuccessfulLogin={handleSuccessfulLogin} />
      )}
    </NavigationContainer>
  );
}