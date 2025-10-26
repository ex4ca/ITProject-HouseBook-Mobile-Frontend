/** @type {import('jest').Config} */
module.exports = {
  preset: "jest-expo",
  testEnvironment: "jsdom",

  transform: { "^.+\\.(js|jsx|ts|tsx)$": "babel-jest" },
  transformIgnorePatterns: [
    "/node_modules/(?!(?:"
      + "react-native"
      + "|@react-native"
      + "|react-native-gesture-handler"
      + "|react-native-reanimated"
      + "|react-native-vector-icons"
      + "|@react-navigation"
      + "|expo"
      + "|@expo"
      + "|expo-router"
      + "|expo-asset"
      + "|expo-font"
      + "|expo-modules-core"
      + "|react-native-url-polyfill"
      + "|@unimodules"
      + "|lucide-react-native"
    + ")/)"
  ],

  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],


  moduleNameMapper: {
    "\\.(png|jpg|jpeg|gif|svg)$": "<rootDir>/__mocks__/fileMock.js",
    "^@/(.*)$": "<rootDir>/src/$1",
    "^src/(.*)$": "<rootDir>/src/$1",
    "^@env$": "<rootDir>/__mocks__/envMock.js",
  },
};
