module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // Add any additional plugins here
      'react-native-reanimated/plugin',
    ],
  };
}; 