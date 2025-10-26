// Testing Library matchers
import "@testing-library/jest-native/extend-expect";



// ---- Common RN mocks ----
jest.mock(
  "react-native-reanimated",
  () => {
    const { View, ScrollView } = require("react-native");
    const NOOP = () => {};
    return {
      View,
      ScrollView,
      // common hooks/utilities mocked enough for component tests
      useSharedValue: (v) => ({ value: v }),
      useAnimatedStyle: (fn) => fn ? fn() : {},
      withTiming: (v) => v,
      withSpring: (v) => v,
      Easing: { linear: NOOP, inOut: NOOP },
      runOnJS: (fn) => fn,
      interpolate: (v) => v,
      Extrapolate: { CLAMP: "clamp" },
    };
  },
  { virtual: true }
);

// Native animated helper mock (prevents warnings)
jest.mock("react-native/Libraries/Animated/NativeAnimatedHelper", () => ({}), { virtual: true });


// ---- Navigation helpers ----
jest.mock("@react-navigation/native", () => {
  const actual = jest.requireActual("@react-navigation/native");
  return {
    ...actual,
    useNavigation: () => ({ navigate: jest.fn(), goBack: jest.fn(), replace: jest.fn() }),
    useRoute: () => ({ params: {} }),
  };
});

// ---- Expo camera / barcode (perm granted) ----
jest.mock("expo-camera", () => ({
  Camera: { requestCameraPermissionsAsync: async () => ({ status: "granted" }) },
}));
jest.mock("expo-barcode-scanner", () => ({
  BarCodeScanner: { requestPermissionsAsync: async () => ({ status: "granted" }) },
}));

// ---- lucide-react-native -> render simple View ----
jest.mock("lucide-react-native", () => {
  const React = require("react");
  const { View } = require("react-native");
  return new Proxy({}, { get: () => (props) => React.createElement(View, props) });
});

// ---- Supabase client (safe defaults; tests can override) ----
jest.mock("./src/config/supabaseClient", () => ({
  supabase: {
    auth: {
      getSession: jest.fn().mockResolvedValue({ data: { session: null } }),
      getUser: jest.fn().mockResolvedValue({ data: { user: { id: "test-user" } } }),
      onAuthStateChange: jest.fn(() => ({ data: { subscription: { unsubscribe: jest.fn() } } })),
      signInWithPassword: jest.fn(),
      signOut: jest.fn(),
    },
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: {}, error: null }),
    })),
    storage: { from: jest.fn(() => ({ getPublicUrl: jest.fn(() => ({ data: { publicUrl: "" } })) })) },
  },
}));

jest.mock(
  "react-native-gesture-handler",
  () => {
    const React = require("react");
    const { View, TouchableOpacity } = require("react-native");
    return {
      // components
      Swipeable: View,
      DrawerLayout: View,
      PanGestureHandler: View,
      TapGestureHandler: View,
      LongPressGestureHandler: View,
      FlingGestureHandler: View,
      PinchGestureHandler: View,
      RotationGestureHandler: View,
      ForceTouchGestureHandler: View,
      NativeViewGestureHandler: View,
      GestureHandlerRootView: View,
      RectButton: TouchableOpacity,
      BorderlessButton: TouchableOpacity,

      // utils
      State: {},
      Directions: {},
      GestureDetector: View,
      gestureHandlerRootHOC: (C) => C,
      createNativeWrapper: (C) => C,
    };
  },
  { virtual: true }
);
