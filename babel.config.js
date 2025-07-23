module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // This is the essential plugin for all animations to work.
      'react-native-reanimated/plugin',
    ],
  };
};
