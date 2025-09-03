import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
} from 'react-native';
import { mockProperties } from '../../constants/mockData';

const QRScanner = ({ navigation }) => {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);

  useEffect(() => {
    // Request camera permissions
    requestCameraPermission();
  }, []);

  const requestCameraPermission = async () => {
    // For development, automatically grant permission
    // In production, you would use expo-camera or react-native-camera
    // const { status } = await Camera.requestCameraPermissionsAsync();
    // setHasPermission(status === 'granted');
    setHasPermission(true);
  };

  const handleBarCodeScanned = ({ data }) => {
    setScanned(true);
    
    // Validate QR code against properties
    const property = validatePropertyQR(data);
    
    if (property) {
      Alert.alert(
        'Property Found',
        `${property.address}\nStatus: ${property.status}`,
        [
          {
            text: 'Enter PIN',
            onPress: () => navigation.navigate('PinEntry', { property }),
          },
          {
            text: 'Scan Again',
            onPress: () => setScanned(false),
          },
        ]
      );
    } else {
      Alert.alert(
        'Property Not Found',
        'This QR code does not match any property in the system.',
        [
          {
            text: 'Scan Again',
            onPress: () => setScanned(false),
          },
          {
            text: 'Cancel',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    }
  };

  const validatePropertyQR = (qrData) => {
    // For development, extract property ID from QR code
    // Expected format: "property-{id}-qr-code" or just "{id}"
    const propertyId = qrData.includes('property-') 
      ? qrData.split('-')[1] 
      : qrData;
    
    // Find property in mock data
    return mockProperties.find(property => property.id === propertyId);
  };

  const simulateQRScan = () => {
    // For development purposes - using existing property ID from mock data
    handleBarCodeScanned({ data: 'property-1-qr-code' });
  };

  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <Text>Requesting camera permission...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No access to camera</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={requestCameraPermission}
        >
          <Text style={styles.buttonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with back button */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
      </View>
      
      {/* Camera View Placeholder */}
      <View style={styles.cameraContainer}>
        <View style={styles.overlay}>
          {/* Top section with tabs */}
          <View style={styles.topTabs}>
            <View style={styles.tab}>
              <Text style={styles.tabIcon}>🖼️</Text>
            </View>
            <View style={styles.tab}>
              <Text style={styles.tabIcon}>⚡</Text>
            </View>
            <View style={styles.tab}>
              <Text style={styles.tabIcon}>🔄</Text>
            </View>
          </View>

          {/* QR Code Scanning Frame */}
          <View style={styles.scanningArea}>
            <View style={styles.qrFrame}>
              {/* Corner brackets */}
              <View style={[styles.corner, styles.topLeft]} />
              <View style={[styles.corner, styles.topRight]} />
              <View style={[styles.corner, styles.bottomLeft]} />
              <View style={[styles.corner, styles.bottomRight]} />
              
              {/* QR Code Pattern (for visual representation) */}
              <View style={styles.qrPattern}>
                <View style={styles.qrRow}>
                  <View style={[styles.qrBlock, styles.filled]} />
                  <View style={[styles.qrBlock, styles.filled]} />
                  <View style={styles.qrBlock} />
                  <View style={[styles.qrBlock, styles.filled]} />
                </View>
                <View style={styles.qrRow}>
                  <View style={styles.qrBlock} />
                  <View style={[styles.qrBlock, styles.filled]} />
                  <View style={[styles.qrBlock, styles.filled]} />
                  <View style={styles.qrBlock} />
                </View>
                <View style={styles.qrRow}>
                  <View style={[styles.qrBlock, styles.filled]} />
                  <View style={styles.qrBlock} />
                  <View style={[styles.qrBlock, styles.filled]} />
                  <View style={[styles.qrBlock, styles.filled]} />
                </View>
              </View>
            </View>
          </View>

          {/* Bottom Controls */}
          <View style={styles.bottomControls}>
            <TouchableOpacity style={styles.controlButton}>
              <Text style={styles.controlIcon}>📱</Text>
              <Text style={styles.controlLabel}>Generate</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.scanButton}
              onPress={simulateQRScan}
            >
              <View style={styles.scanButtonInner}>
                <Text style={styles.scanButtonText}>📷</Text>
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.controlButton}>
              <Text style={styles.controlIcon}>🕒</Text>
              <Text style={styles.controlLabel}>History</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 10,
    backgroundColor: '#000',
  },
  backButton: {
    alignSelf: 'flex-start',
  },
  backButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '500',
  },
  cameraContainer: {
    flex: 1,
    position: 'relative',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  topTabs: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingTop: 50,
    paddingBottom: 20,
  },
  tab: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 40,
    paddingVertical: 15,
    marginHorizontal: 5,
    borderRadius: 25,
  },
  tabIcon: {
    fontSize: 20,
    textAlign: 'center',
  },
  scanningArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrFrame: {
    width: 250,
    height: 250,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: '#fff',
    borderWidth: 3,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  topRight: {
    top: 0,
    right: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  qrPattern: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 8,
  },
  qrRow: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  qrBlock: {
    width: 15,
    height: 15,
    backgroundColor: '#fff',
    marginRight: 5,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  filled: {
    backgroundColor: '#000',
  },
  bottomControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingBottom: 50,
    paddingHorizontal: 40,
  },
  controlButton: {
    alignItems: 'center',
  },
  controlIcon: {
    fontSize: 24,
    marginBottom: 5,
  },
  controlLabel: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  scanButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanButtonInner: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },
  scanButtonText: {
    fontSize: 30,
  },
  errorText: {
    fontSize: 18,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default QRScanner;
