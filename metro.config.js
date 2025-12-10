// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Fix for axios FormData issue
const originalResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  // Fix axios trying to import Node.js FormData
  if (moduleName && (
    moduleName.includes('../platform/node/classes/FormData.js') ||
    moduleName.includes('platform/node/classes/FormData')
  )) {
    // Return empty module - axios will fallback to browser FormData
    return {
      type: 'empty',
    };
  }
  
  // Use default resolver for everything else
  if (originalResolveRequest) {
    return originalResolveRequest(context, moduleName, platform);
  }
  
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;

