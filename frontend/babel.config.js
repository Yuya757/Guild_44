module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // Reanimatedプラグインを追加
      'react-native-reanimated/plugin',
    ],
  };
}; 