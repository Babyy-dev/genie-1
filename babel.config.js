// babel.config.js
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // This line is absolutely essential for the animation to work.
      'react-native-reanimated/plugin',
    ],
  };
};
