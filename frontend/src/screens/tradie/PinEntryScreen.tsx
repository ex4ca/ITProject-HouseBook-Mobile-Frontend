import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  StyleSheet, 
  Alert, 
  ActivityIndicator,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  Platform 
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { claimJobWithPin } from '../../services/FetchAuthority';
import { PALETTE } from '../../styles/palette';
import Button from '../../components/Button';

export default function PinEntryScreen() {
  const route = useRoute();
  const navigation: any = useNavigation();
  const { propertyId } = route.params as { propertyId: string };
  
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    // Dismiss the keyboard before showing alerts or navigating
    Keyboard.dismiss();
    if (pin.length < 4 || loading) return;

    setLoading(true);
    try {
      const result = await claimJobWithPin(propertyId, pin);

      Alert.alert(
        result.success ? 'Success' : 'Failed',
        result.message,
        [{ 
          text: 'OK', 
          onPress: () => {
            if (result.success) {
              // On success, navigate to the main jobs screen
              navigation.navigate('Main', { screen: 'Jobs' });
            } else {
              // On failure, just clear the PIN to allow a retry
              setPin('');
            }
          } 
        }]
      );
    } catch (error: any) {
      Alert.alert(
        'Error', 
        error.message || 'An unexpected error occurred.',
        // ✅ On a general error, also stay on the page and clear the PIN
        [{ text: 'OK', onPress: () => setPin('') }]
      );
    } finally {
      setLoading(false);
    }
  };

  // Auto-submit when PIN is 6 digits long
  useEffect(() => {
    if (pin.length === 6) {
      handleSubmit();
    }
  }, [pin]);


  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.innerContainer}>
          <Text style={styles.title}>Enter Job PIN</Text>
          <Text style={styles.subtitle}>
            Enter the PIN associated with this job to claim it.
          </Text>
          <TextInput
            style={styles.pinInput}
            value={pin}
            onChangeText={setPin}
            keyboardType="number-pad"
            maxLength={6}
            placeholder="••••••"
            placeholderTextColor="#9CA3AF"
          />
          {loading ? (
            <ActivityIndicator size="large" color={PALETTE.primary} style={{ marginTop: 20 }}/>
          ) : (
            <Button text="Claim Job" onPress={handleSubmit} />
          )}
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: PALETTE.background,
  },
  innerContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    color: PALETTE.textPrimary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: PALETTE.textSecondary,
    marginBottom: 32,
  },
  pinInput: {
    backgroundColor: PALETTE.card,
    borderWidth: 1,
    borderColor: PALETTE.border,
    borderRadius: 12,
    padding: 16,
    fontSize: 24,
    textAlign: 'center',
    letterSpacing: 8,
    color: PALETTE.textPrimary,
    marginBottom: 24,
  },
});