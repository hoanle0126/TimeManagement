module.exports = function(api) {
  // Use 'false' for development to enable Fast Refresh
  // Use 'true' for production builds
  api.cache(false);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      'react-native-reanimated/plugin',
      ['transform-inline-environment-variables', {
        include: ['REACT_APP_API_URL']
      }]
    ],
  };
};

