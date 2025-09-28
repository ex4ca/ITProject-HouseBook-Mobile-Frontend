import React, {useState} from 'react';
import { View, Text, StyleSheet, Button, Alert } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useNavigation } from '@react-navigation/native';
import { claimJobByPropertyId } from '../../services/FetchAuthority';
import { PALETTE } from '../../styles/palette';

export default function QRScannerScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const navigation: any = useNavigation();

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>We need your permission to show the camera</Text>
        <Button onPress={requestPermission} title="Grant Permission" />
      </View>
    );
  }

  const handleBarCodeScanned = async ({ data }: { data: string }) => {
    setScanned(true);
    const propertyId = data;

    try {
      const result = await claimJobByPropertyId(propertyId);
      Alert.alert(
        result.success ? 'Success' : 'Notice',
        result.message,
        // Correctly navigate to the nested "Jobs" tab within the "Main" screen.
        [{ text: 'OK', onPress: () => navigation.navigate('Main', { screen: 'Jobs' }) }]
      );
    } catch (error: any) {
      Alert.alert(
        'Error', 
        error.message || 'An unexpected error occurred.',
        [{ text: 'OK', onPress: () => navigation.navigate('Main', { screen: 'Jobs' }) }]
      );
    }
  };

  return (
    <View style={styles.container}>
      <CameraView
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        style={StyleSheet.absoluteFillObject}
      />
      <View style={styles.overlay}>
        <Text style={styles.title}>Scan Property QR Code</Text>
        <View style={styles.scanBox} />
        {scanned && <Button title={'Tap to Scan Again'} onPress={() => setScanned(false)} color={PALETTE.primary}/>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    backgroundColor: '#000',
  },
  text: {
    color: '#fff',
    textAlign: 'center',
    marginBottom: 20,
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
    position: 'absolute',
    top: 100,
  },
  scanBox: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: 'white',
    borderRadius: 12,
  },
});

