module.exports = {
  // Use babel-jest so the project's Babel config (expo preset) compiles TSX/JSX
  transform: {
    '^.+\\.[tj]sx?$': require.resolve('babel-jest'),
  },
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|@react-navigation|@react-native-community)/)'
  ],
};
