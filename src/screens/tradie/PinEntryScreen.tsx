import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { claimJobWithPin } from '../../services/FetchAuthority';
import { PALETTE } from '../../styles/palette';
import Button from '../../components/Button'; // Assuming you have a standard Button component

export default function PinEntryScreen() {
  const route = useRoute();
  const navigation: any = useNavigation();
  const { propertyId } = route.params as { propertyId: string };
  
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (pin.length < 4 || loading) return; // Basic validation

    setLoading(true);
    try {
      const result = await claimJobWithPin(propertyId, pin);
      Alert.alert(
        result.success ? 'Success' : 'Failed',
        result.message,
        // Navigate back to the job board after the user dismisses the alert.
        [{ text: 'OK', onPress: () => navigation.navigate('Main', { screen: 'Jobs' }) }]
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
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
        secureTextEntry
      />
      {loading ? (
        <ActivityIndicator size="large" color={PALETTE.primary} style={{ marginTop: 20 }}/>
      ) : (
        <Button text="Claim Job" onPress={handleSubmit} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: PALETTE.background,
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
