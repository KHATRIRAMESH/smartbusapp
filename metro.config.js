// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Uncomment the following line if you encounter ES Module compatibility issues
// config.resolver.unstable_enablePackageExports = false;

module.exports = config; 