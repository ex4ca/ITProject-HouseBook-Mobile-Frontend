import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useNavigation } from '@react-navigation/native';
import Button from '../../components/Button';

export default function QRScannerScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const navigation: any = useNavigation();

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>We need your permission to show the camera</Text>
        <Button onPress={requestPermission} text="Grant Permission" />
      </View>
    );
  }

  /**
   * After scanning, navigate to the PinEntryScreen and pass the propertyId.
   */
  const handleBarCodeScanned = ({ data }: { data: string }) => {
    // Prevent multiple scans by navigating away immediately.
    navigation.replace('PinEntryScreen', { propertyId: data });
  };

  return (
    <View style={styles.container}>
      <CameraView
        onBarcodeScanned={handleBarCodeScanned}
        style={StyleSheet.absoluteFillObject}
      />
      <View style={styles.overlay}>
        <Text style={styles.title}>Scan Property QR Code</Text>
        <View style={styles.scanBox} />
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