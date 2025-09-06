import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert, 
} from 'react-native';
import { Button, TextField } from '../../components/common';
import { COLORS, FONTS, STYLES } from '../../components/styles/constants';
import { supabase } from '../../services/supabase'; 

const Login = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isOwner, setIsOwner] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both an email and password.');
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) {
      Alert.alert('Login Error', error.message);
    }
    
    setLoading(false);
  };

  const handleSignUp = () => {
    navigation.navigate('SignUp', { isOwner });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* App Name/Icon Section */}
        <View style={styles.headerSection}>
          <Text style={styles.appName}>Housebook</Text>
        </View>

        {/* Role Toggle */}
        <View style={styles.roleToggle}>
          <TouchableOpacity
            style={[styles.roleButton, styles.leftRoleButton, isOwner && styles.activeRoleButton]}
            onPress={() => setIsOwner(!isOwner)}
          >
            <Text style={[styles.roleText, isOwner && styles.activeRoleText]}>
              Owner
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.roleButton, styles.rightRoleButton, !isOwner && styles.activeRoleButton]}
            onPress={() => setIsOwner(!isOwner)}
          >
            <Text style={[styles.roleText, !isOwner && styles.activeRoleText]}>
              Tradie
            </Text>
          </TouchableOpacity>
        </View>

        {/* Input Fields */}
        <View style={styles.inputContainer}>
          <TextField
            // Changed placeholder and value to use email
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            style={styles.input}
            keyboardType="email-address" // Set keyboard type for email
            autoCapitalize="none"
          />
          
          <TextField
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={true}
            style={styles.input}
          />
        </View>

        {/* Sign In Button */}
        <Button
          // Show loading state on the button
          text={loading ? "Signing In..." : "Sign In"}
          onPress={handleLogin}
          style={styles.signInButton}
          disabled={loading} // Disable button while loading
        />

        {/* Sign Up Link */}
        <View style={styles.signUpContainer}>
          <Text style={styles.signUpText}>Don't have an account? </Text>
          <Button
            text="Sign up"
            onPress={handleSignUp}
            style={styles.signUpButton}
            textStyle={styles.signUpButtonText}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  content: {
    flex: 1,
    paddingHorizontal: STYLES.spacing.xxl,
    justifyContent: 'center',
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: STYLES.spacing.lg,
    marginTop: STYLES.spacing.xxl * 2,
  },
  appName: {
    ...FONTS.title,
    textAlign: 'center',
  },
  roleToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: STYLES.spacing.xxl * 4,
    alignSelf: 'center',
  },
  roleButton: {
    paddingVertical: STYLES.spacing.sm,
    paddingHorizontal: STYLES.spacing.lg,
    backgroundColor: COLORS.secondary,
    borderWidth: 1,
    borderColor: COLORS.secondary,
  },
  leftRoleButton: {
    borderTopLeftRadius: STYLES.borderRadius.medium,
    borderBottomLeftRadius: STYLES.borderRadius.medium,
    borderRightWidth: 0,
  },
  rightRoleButton: {
    borderTopRightRadius: STYLES.borderRadius.medium,
    borderBottomRightRadius: STYLES.borderRadius.medium,
    borderLeftWidth: 0,
  },
  activeRoleButton: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  roleText: {
    ...FONTS.hintText,
    fontSize: 16,
    textAlign: 'center',
  },
  activeRoleText: {
    ...FONTS.highlightText,
    fontSize: 16,
  },
  inputContainer: {
    marginBottom: STYLES.spacing.xxl * 2,
  },
  input: {
    marginBottom: STYLES.spacing.xl,
    height: 60,
  },
  signInButton: {
    marginBottom: STYLES.spacing.lg,
    height: 60,
  },
  signUpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signUpText: {
    ...FONTS.commonText,
    fontSize: 16,
    marginRight: STYLES.spacing.sm,
  },
  signUpButton: {
    backgroundColor: 'transparent',
    paddingHorizontal: STYLES.spacing.lg,
    paddingVertical: STYLES.spacing.sm,
    height: 40,
  },
  signUpButtonText: {
    color: COLORS.primary,
    fontSize: 16,
  },
});

export default Login;
