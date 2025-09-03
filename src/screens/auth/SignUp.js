import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { Button, TextField, Checkbox } from '../../components/common';
import { COLORS, FONTS, STYLES } from '../../components/styles/constants';

const SignUp = ({ navigation, route }) => {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  
  // Get the role from navigation params, default to owner if not provided
  const isOwner = route?.params?.isOwner ?? true;
  const roleText = isOwner ? 'Owner' : 'Tradie';

  const handleSignUp = () => {
    if (name && username && password && confirmPassword && agreeToTerms) {
      if (password === confirmPassword) {
        // TODO: Implement actual registration
        navigation.navigate('Login');
      } else {
        alert('Passwords do not match');
      }
    } else {
      alert('Please fill in all fields and agree to terms');
    }
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
              placeholder="Name"
              value={name}
              onChangeText={setName}
              style={styles.input}
            />
            
            <TextField
              placeholder="Username"
              value={username}
              onChangeText={setUsername}
              keyboardType="default"
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
            text="Sign up"
            onPress={handleSignUp}
            style={styles.signUpButton}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  // Main Container (Root)
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  
  // Top Navigation Header
  header: {
    paddingHorizontal: STYLES.spacing.lg,
    paddingTop: STYLES.spacing.sm,
    paddingBottom: STYLES.spacing.sm,
    backgroundColor: COLORS.white,
    marginBottom: 0, // Adjust this to add space after header
  },
  backButton: {
    alignSelf: 'flex-start',
  },
  backButtonText: {
    ...FONTS.commonText,
    fontSize: 18,
  },
  
  // Scroll Container
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: STYLES.spacing.xxl,
    justifyContent: 'center',
  },
  
  // Title Section (Top of content)
  headerSection: {
    alignItems: 'center',
    marginTop: STYLES.spacing.xxl * 1, // Space from top
    marginBottom: STYLES.spacing.xxl * 1, // Space before inputs
  },
  title: {
    ...FONTS.screenTitle,
    textAlign: 'center',
    lineHeight: 36,
  },
  titleBold: {
    fontWeight: 'bold',
  },
  
  // Input Fields Section
  inputContainer: {
    marginBottom: STYLES.spacing.xl, // Space before terms
  },
  input: {
    marginBottom: STYLES.spacing.xl, // Space between each input
    height: 60,
  },
  
  // Terms & Conditions Section
  termsContainer: {
    marginBottom: STYLES.spacing.xxl * 0.5, // Space before sign up button
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
  
  // Sign Up Button (Bottom of content)
  signUpButton: {
    height: 60,
    marginBottom: STYLES.spacing.xxl, // Space at bottom
  },
});

export default SignUp;
