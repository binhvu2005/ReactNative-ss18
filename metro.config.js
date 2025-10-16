// Metro configuration for React Native/Expo
// Enable package exports resolution (needed by @tanstack/*) and support cjs files
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.resolver = config.resolver || {};
config.resolver.unstable_enablePackageExports = true;
config.resolver.sourceExts = Array.from(new Set([...(config.resolver.sourceExts || []), 'cjs']));

module.exports = config;


