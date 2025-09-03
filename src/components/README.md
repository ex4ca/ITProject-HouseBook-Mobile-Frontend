# Components Directory

This directory should contain reusable React Native components.

## Suggested Components:

### UI Components:
- `Button.js` - Standardized button component
- `Input.js` - Standardized text input component
- `Card.js` - Property card component
- `Modal.js` - Custom modal component
- `Loading.js` - Loading spinner component
- `Icon.js` - Icon wrapper component

### Property Components:
- `PropertyCard.js` - Individual property card for lists
- `PropertyImage.js` - Property image with placeholder
- `StatusBadge.js` - Status indicator component
- `ComponentTag.js` - Individual component tag

### Form Components:
- `FormInput.js` - Form input with validation
- `FormButton.js` - Form submission button
- `FormSelect.js` - Dropdown selection component
- `FormCheckbox.js` - Checkbox input component

### Navigation Components:
- `TabBar.js` - Custom tab bar component
- `Header.js` - Custom header component
- `BackButton.js` - Standardized back button

### Scanner Components:
- `QRFrame.js` - QR code scanning frame
- `PinInput.js` - PIN entry component
- `NumberPad.js` - Numeric keypad component

## Usage Example:
```javascript
import Button from '../components/Button';
import PropertyCard from '../components/PropertyCard';

// In your screen component
<Button 
  title="Sign In" 
  onPress={handleSignIn}
  style={styles.primaryButton}
/>

<PropertyCard 
  property={propertyData}
  onPress={() => navigate('PropertyDetails')}
/>
```

## Component Guidelines:
- Use consistent prop names across components
- Include PropTypes for type checking
- Support theming through style props
- Include accessibility props
- Keep components focused and reusable
