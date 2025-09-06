import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert, 
} from 'react-native';
import { Button, TextField, Checkbox } from '../../components/common';
import { COLORS, FONTS, STYLES } from '../../components/styles/constants';
import { supabase } from '../../services/supabase';

const SignUp = ({ navigation, route }) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [loading, setLoading] = useState(false); 

  const isOwner = route?.params?.isOwner ?? true;
  const roleText = isOwner ? 'Owner' : 'Tradie';

  const handleSignUp = async () => {
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      Alert.alert('Missing Information', 'Please fill in all fields.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Password Mismatch', 'The passwords do not match.');
      return;
    }
    if (!agreeToTerms) {
      Alert.alert('Terms and Conditions', 'You must agree to the terms and policy to continue.');
      return;
    }

    setLoading(true);

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: email,
      password: password,
    });

    if (authError) {
      Alert.alert('Sign Up Error', authError.message);
      setLoading(false);
      return;
    }
    if (!authData.user) {
      Alert.alert('Sign Up Error', 'An unexpected issue occurred. Please try again.');
      setLoading(false);
      return;
    }

    const { error: profileError } = await supabase
      .from('User') 
      .insert({
        user_id: authData.user.id, 
        first_name: firstName,
        last_name: lastName,
        email: email,
      });

    if (profileError) {
      Alert.alert('Profile Creation Error', profileError.message);
      setLoading(false);
      return;
    }
    
    const roleTable = isOwner ? 'Owner' : 'Tradesperson';
    const { error: roleError } = await supabase
      .from(roleTable)
      .insert({
        user_id: authData.user.id,
      });

    if (roleError) {
      Alert.alert('Role Assignment Error', roleError.message);
    } else {
      Alert.alert(
        'Success!',
        'Your account has been created. Please check your email for a confirmation link.'
      );
    }

    setLoading(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Back Button */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.headerSection}>
            <Text style={styles.title}>Create Your <Text style={styles.titleBold}>{roleText}</Text> Account</Text>
          </View>

          {/* Input Fields */}
          <View style={styles.inputContainer}>
            <TextField
              placeholder="First Name"
              value={firstName}
              onChangeText={setFirstName}
              style={styles.input}
            />
             <TextField
              placeholder="Last Name"
              value={lastName}
              onChangeText={setLastName}
              style={styles.input}
            />
            
            <TextField
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              style={styles.input}
            />
            
            <TextField
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={true}
              style={styles.input}
            />
            
            <TextField
              placeholder="Confirm Password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={true}
              style={styles.input}
            />
          </View>

          {/* Terms and Conditions */}
          <View style={styles.termsContainer}>
            <Checkbox
              checked={agreeToTerms}
              onPress={() => setAgreeToTerms(!agreeToTerms)}
              label={
                <Text style={styles.termsText}>
                  I understand the <Text style={styles.termsLink}>Terms & Policy</Text>
                </Text>
              }
              style={styles.checkbox}
            />
          </View>

          {/* Sign Up Button */}
          <Button
            text={loading ? 'Creating Account...' : 'Sign up'}
            onPress={handleSignUp}
            style={styles.signUpButton}
            disabled={loading}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  header: {
    paddingHorizontal: STYLES.spacing.lg,
    paddingTop: STYLES.spacing.sm,
    paddingBottom: STYLES.spacing.sm,
    backgroundColor: COLORS.white,
    marginBottom: 0,
  },
  backButton: {
    alignSelf: 'flex-start',
  },
  backButtonText: {
    ...FONTS.commonText,
    fontSize: 18,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: STYLES.spacing.xxl,
    justifyContent: 'center',
  },
  headerSection: {
    alignItems: 'center',
    marginTop: STYLES.spacing.xxl * 1,
    marginBottom: STYLES.spacing.xxl * 1,
  },
  title: {
    ...FONTS.screenTitle,
    textAlign: 'center',
    lineHeight: 36,
  },
  titleBold: {
    fontWeight: 'bold',
  },
  inputContainer: {
    marginBottom: STYLES.spacing.xl,
  },
  input: {
    marginBottom: STYLES.spacing.xl,
    height: 60,
  },
  termsContainer: {
    marginBottom: STYLES.spacing.xxl * 0.5,
  },
  checkbox: {
    alignItems: 'flex-start',
  },
  termsText: {
    ...FONTS.smallText,
    fontSize: 14,
    flex: 1,
    opacity: 0.8,
  },
  termsLink: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  signUpButton: {
    height: 60,
    marginBottom: STYLES.spacing.xxl,
  },
});

export default SignUp;
