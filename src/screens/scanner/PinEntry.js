// import React, { useState } from 'react';
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   StyleSheet,
//   SafeAreaView,
// } from 'react-native';

// const PinEntry = ({ navigation }) => {
//   const [pin, setPin] = useState('');
//   const [isTradie] = useState(true); // This would come from props/context

//   const handleNumberPress = (number) => {
//     if (pin.length < 6) {
//       setPin(pin + number);
//     }
//   };

//   const handleDelete = () => {
//     setPin(pin.slice(0, -1));
//   };

//   const handlePinSubmit = () => {
//     if (pin.length === 6) {
//       // TODO: Validate PIN with backend
//       navigation.navigate('Main');
//     }
//   };

//   const renderPinDisplay = () => {
//     const boxes = [];
//     for (let i = 0; i < 6; i++) {
//       boxes.push(
//         <View key={i} style={[styles.pinBox, pin[i] && styles.pinBoxFilled]}>
//           <Text style={styles.pinDigit}>{pin[i] || ''}</Text>
//         </View>
//       );
//     }
//     return boxes;
//   };

//   const NumberButton = ({ number, onPress }) => (
//     <TouchableOpacity style={styles.numberButton} onPress={() => onPress(number)}>
//       <Text style={styles.numberButtonText}>{number}</Text>
//     </TouchableOpacity>
//   );

//   return (
//     <SafeAreaView style={styles.container}>
//       {/* Header */}
//       <View style={styles.header}>
//         <TouchableOpacity 
//           style={styles.backButton} 
//           onPress={() => navigation.goBack()}
//         >
//           <Text style={styles.backButtonText}>← Back</Text>
//         </TouchableOpacity>
//       </View>

//       <View style={styles.content}>
//         {/* PIN Entry Title */}
//         <Text style={styles.title}>Enter Pin</Text>

//         {/* PIN Display */}
//         <View style={styles.pinContainer}>
//           {renderPinDisplay()}
//         </View>

//         {/* Number Pad */}
//         <View style={styles.numberPad}>
//           <View style={styles.numberRow}>
//             <NumberButton number="1" onPress={handleNumberPress} />
//             <NumberButton number="2" onPress={handleNumberPress} />
//             <NumberButton number="3" onPress={handleNumberPress} />
//           </View>
//           <View style={styles.numberRow}>
//             <NumberButton number="4" onPress={handleNumberPress} />
//             <NumberButton number="5" onPress={handleNumberPress} />
//             <NumberButton number="6" onPress={handleNumberPress} />
//           </View>
//           <View style={styles.numberRow}>
//             <NumberButton number="7" onPress={handleNumberPress} />
//             <NumberButton number="8" onPress={handleNumberPress} />
//             <NumberButton number="9" onPress={handleNumberPress} />
//           </View>
//           <View style={styles.numberRow}>
//             <View style={styles.numberButton} />
//             <NumberButton number="0" onPress={handleNumberPress} />
//             <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
//               <Text style={styles.deleteButtonText}>Delete</Text>
//             </TouchableOpacity>
//           </View>
//         </View>

//         {/* Submit when PIN is complete */}
//         {pin.length === 6 && (
//           <TouchableOpacity style={styles.submitButton} onPress={handlePinSubmit}>
//             <Text style={styles.submitButtonText}>Enter</Text>
//           </TouchableOpacity>
//         )}
//       </View>
//     </SafeAreaView>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#f5f5f5',
//   },
//   header: {
//     paddingHorizontal: 20,
//     paddingTop: 10,
//   },
//   backButton: {
//     alignSelf: 'flex-start',
//   },
//   backButtonText: {
//     fontSize: 18,
//     color: '#333',
//     fontWeight: '500',
//   },
//   content: {
//     flex: 1,
//     alignItems: 'center',
//     paddingHorizontal: 40,
//     paddingTop: 60,
//   },
//   title: {
//     fontSize: 24,
//     fontWeight: '600',
//     color: '#333',
//     marginBottom: 40,
//   },
//   pinContainer: {
//     flexDirection: 'row',
//     justifyContent: 'center',
//     marginBottom: 60,
//     borderWidth: 2,
//     borderColor: '#333',
//     paddingHorizontal: 20,
//     paddingVertical: 15,
//     borderRadius: 8,
//   },
//   pinBox: {
//     width: 20,
//     height: 20,
//     marginHorizontal: 5,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   pinBoxFilled: {
//     backgroundColor: '#333',
//   },
//   pinDigit: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     color: '#fff',
//   },
//   numberPad: {
//     alignItems: 'center',
//   },
//   numberRow: {
//     flexDirection: 'row',
//     marginBottom: 20,
//   },
//   numberButton: {
//     width: 80,
//     height: 80,
//     borderRadius: 40,
//     backgroundColor: '#d0d0d0',
//     alignItems: 'center',
//     justifyContent: 'center',
//     marginHorizontal: 10,
//   },
//   numberButtonText: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     color: '#333',
//   },
//   deleteButton: {
//     width: 80,
//     height: 80,
//     alignItems: 'center',
//     justifyContent: 'center',
//     marginHorizontal: 10,
//   },
//   deleteButtonText: {
//     fontSize: 16,
//     color: '#333',
//     fontWeight: '500',
//   },
//   submitButton: {
//     backgroundColor: '#000',
//     paddingHorizontal: 40,
//     paddingVertical: 15,
//     borderRadius: 8,
//     marginTop: 30,
//   },
//   submitButtonText: {
//     color: '#fff',
//     fontSize: 18,
//     fontWeight: '600',
//   },
// });

// export default PinEntry;
