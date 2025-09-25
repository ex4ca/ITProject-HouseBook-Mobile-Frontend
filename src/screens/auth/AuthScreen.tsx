import React, { useState } from "react";
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { Home, Wrench } from "lucide-react-native";
import { Button, TextField, Checkbox } from "../../components";

import { loginUser, signupUser } from "../../services/AuthService";
import { authStyles as styles } from "../../styles/authStyles";
import { PALETTE } from "../../styles/palette";
import type { UserRole } from "../../types";

interface AuthScreenProps {
  onSuccessfulLogin: (role: UserRole) => void;
}

const AuthScreen = ({ onSuccessfulLogin }: AuthScreenProps) => {
  const MINPASSWORDLEN = 6;
  const MAXEMAILLEN = 254;
  const MAXNAMELEN = 50;
  const MAXPASSWORDLEN = 128;
  const [activeTab, setActiveTab] = useState("login");
  const [userType, setUserType] = useState<UserRole>("owner");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter both an email and password.");
      return;
    }
    setLoading(true);
    try {
      await loginUser(email, password, userType);
      onSuccessfulLogin(userType);
    } catch (error: any) {
      Alert.alert("Login Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async () => {
    if (!firstName || !lastName || !email || !password || !confirmPassword || !phone) {
      Alert.alert("Missing Information", "Please fill in all fields.");
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert("Password Mismatch", "Passwords do not match.");
      return;
    }
    if (!agreeToTerms) {
      Alert.alert("Terms and Conditions", "You must agree to the terms to continue.");
      return;
    }
    if (!firstName.trim().match(/^[\p{L}]+(?:[\s'-][\p{L}]+)*$/u)) {
      Alert.alert("Invalid First Name", "First name can only contain letters, spaces, hyphens, and apostrophes.");
      return;
    }
    if (!lastName.trim().match(/^[\p{L}]+(?:[\s'-][\p{L}]+)*$/u)) {
      Alert.alert("Invalid Last Name", "Last name can only contain letters, spaces, hyphens, and apostrophes.");
      return;
    }
    if (!email.match(/^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/)) {
      Alert.alert("Invalid Email", "Please enter a valid email address.");
      return;
    }
    if (!phone.match(/^[0-9]{2,4}[- ]?[0-9]{3,4}[- ]?[0-9]{3,4}$/)) {
      Alert.alert("Invalid Phone Number", "Please enter a valid phone number.");
      return;
    }
    if (password.length < MINPASSWORDLEN) {
      Alert.alert("Weak Password", `Password must be at least ${MINPASSWORDLEN} characters long.`);
      return;
    }
    if (!password.match(/[A-Z]/)) {
      Alert.alert("Weak Password", "Password must contain at least one uppercase letter.");
      return;
    }
    if (!password.match(/[a-z]/)) {
      Alert.alert("Weak Password", "Password must contain at least one lowercase letter.");
      return;
    }
    if (!password.match(/[0-9]/)) {
      Alert.alert("Weak Password", "Password must contain at least one number.");
      return;
    }
    if (!password.match(/[!@#$%^&*(),.?":{}|<>]/)) {
      Alert.alert("Weak Password", "Password must contain at least one special character.");
      return;
    }
    if (email.length > MAXEMAILLEN) {
      Alert.alert("Input Too Long", `Email cannot exceed ${MAXEMAILLEN} characters.`);
      return;
    }
    if (firstName.length > MAXNAMELEN) {
      Alert.alert("Input Too Long", `First name cannot exceed ${MAXNAMELEN} characters.`);
      return;
    }
    if (lastName.length > MAXNAMELEN) {
      Alert.alert("Input Too Long", `Last name cannot exceed ${MAXNAMELEN} characters.`);
      return;
    }
    if (password.length > MAXPASSWORDLEN) {
      Alert.alert("Input Too Long", `Password cannot exceed ${MAXPASSWORDLEN} characters.`);
      return;
    }

    setLoading(true);
    try {
      await signupUser({
        email,
        password,
        first_name: firstName,
        last_name: lastName,
        userType,
        phone,
      });
      Alert.alert("Success!", "Your account has been created. Please check your email for a confirmation link.");
      setActiveTab("login");
    } catch (error: any) {
      Alert.alert("Sign Up Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  const renderLoginForm = () => (
    <View style={styles.formContainer}>
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Email</Text>
        <TextField placeholder="you@example.com" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
      </View>
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Password</Text>
        <TextField placeholder="••••••••" value={password} onChangeText={setPassword} secureTextEntry />
      </View>
      <Button text={loading ? "Signing In..." : "Sign In"} onPress={handleLogin} disabled={loading} style={styles.submitButton} textStyle={styles.submitButtonText} />
    </View>
  );

  const renderSignUpForm = () => (
    <View style={styles.formContainer}>
        <View style={styles.nameContainer}><View style={[styles.inputGroup, { flex: 1 }]}><Text style={styles.label}>First Name</Text><TextField placeholder="John" value={firstName} onChangeText={setFirstName} /></View><View style={{ width: 16 }} /><View style={[styles.inputGroup, { flex: 1 }]}><Text style={styles.label}>Last Name</Text><TextField placeholder="Appleseed" value={lastName} onChangeText={setLastName} /></View></View>
        <View style={styles.inputGroup}><Text style={styles.label}>Email</Text><TextField placeholder="you@example.com" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" /></View>
        <View style={styles.inputGroup}><Text style={styles.label}>Phone</Text><TextField placeholder="Your phone number" value={phone} onChangeText={setPhone} keyboardType="phone-pad" /></View>
        <View style={styles.inputGroup}><Text style={styles.label}>Password</Text><TextField placeholder="Create a strong password" value={password} onChangeText={setPassword} secureTextEntry /></View>
        <View style={styles.inputGroup}><Text style={styles.label}>Confirm Password</Text><TextField placeholder="Confirm your password" value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry /></View>
        <Checkbox checked={agreeToTerms} onPress={() => setAgreeToTerms(!agreeToTerms)} label={<Text style={styles.termsText}>I agree to the <Text style={styles.linkText}>Terms & Policy</Text></Text>} />
        <Button text={loading ? "Creating Account..." : "Create Account"} onPress={handleSignUp} disabled={loading} style={styles.submitButton} textStyle={styles.submitButtonText} />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.header}><Text style={styles.appName}>Housebook</Text><Text style={styles.subtitle}>Property management made simple.</Text></View>
          <View style={styles.card}>
            <View style={styles.roleSelector}>
              <TouchableOpacity style={[styles.roleBadge, userType === "owner" ? styles.activeRoleBadge : {}]} onPress={() => setUserType("owner")}>
                  <Home size={16} color={userType === "owner" ? PALETTE.primary : PALETTE.textSecondary} />
                  <Text style={[styles.roleText, userType === "owner" ? styles.activeRoleText : {}]}>Owner</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.roleBadge, userType === "tradie" ? styles.activeRoleBadge : {}]} onPress={() => setUserType("tradie")}>
                  <Wrench size={16} color={userType === "tradie" ? PALETTE.primary : PALETTE.textSecondary} />
                  <Text style={[styles.roleText, userType === "tradie" ? styles.activeRoleText : {}]}>Tradie</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.tabContainer}>
              <TouchableOpacity style={[styles.tab, activeTab === "login" ? styles.activeTab : {}]} onPress={() => setActiveTab("login")}><Text style={[styles.tabText, activeTab === "login" ? styles.activeTabText : {}]}>Sign In</Text></TouchableOpacity>
              <TouchableOpacity style={[styles.tab, activeTab === "signup" ? styles.activeTab : {}]} onPress={() => setActiveTab("signup")}><Text style={[styles.tabText, activeTab === "signup" ? styles.activeTabText : {}]}>Sign Up</Text></TouchableOpacity>
            </View>
            {loading ? <ActivityIndicator size="large" color={PALETTE.primary} /> : activeTab === "login" ? renderLoginForm() : renderSignUpForm()}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default AuthScreen;