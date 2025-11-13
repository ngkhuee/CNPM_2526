// webpack.config.js
const createExpoWebConfig = require('@expo/webpack-config');

module.exports = async function (env, argv) {
    const config = await createExpoWebConfig(env, argv);

    // Polyfill cho import.meta.url trên Web
    config.resolve = config.resolve || {};
    config.resolve.fallback = config.resolve.fallback || {};
    config.resolve.fallback.url = require.resolve('url/');
    config.resolve.fallback.path = require.resolve('path-browserify');

    return config;
};
