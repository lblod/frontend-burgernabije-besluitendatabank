'use strict';

const EmberApp = require('ember-cli/lib/broccoli/ember-app');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

const isProductionBuild = process.env.EMBER_ENV === 'production';

module.exports = function (defaults) {
  let app = new EmberApp(defaults, {
    '@appuniversum/ember-appuniversum': {
      disableWormholeElement: true,
    },
  });

  const { Webpack } = require('@embroider/webpack');

  const embroiderOptions = {
    staticAddonTestSupportTrees: true,
    staticAddonTrees: true,
    staticHelpers: true,
    staticModifiers: true,
    staticComponents: true,
    staticEmberSource: isProductionBuild,

    // This config is needed to work around an Ember Data v4.12 + Embroider issue
    // We can remove it once the fix is released: // https://github.com/embroider-build/embroider/issues/1506
    compatAdapters: new Map([['@ember-data/debug', null]]),
    packagerOptions: {
      webpackConfig: {
        plugins: [
          process.env.ANALYZE_BUNDLE ? new BundleAnalyzerPlugin() : null,
        ].filter(Boolean),
      },
    },
  };

  if (isProductionBuild) {
    // `staticEmberSource` breaks the Ember dev tools: https://github.com/embroider-build/embroider/issues/1575
    // As a workaround we only enable it for production builds so that we can still use the dev tools for local development
    // while still having a smaller bundle in production.
    embroiderOptions.staticEmberSource = true;
  }

  return require('@embroider/compat').compatBuild(
    app,
    Webpack,
    embroiderOptions
  );
};
