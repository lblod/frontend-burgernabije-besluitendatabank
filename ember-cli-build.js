'use strict';

const EmberApp = require('ember-cli/lib/broccoli/ember-app');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

module.exports = function (defaults) {
  let app = new EmberApp(defaults, {
    '@appuniversum/ember-appuniversum': {
      disableWormholeElement: true,
    },
  });

  const { Webpack } = require('@embroider/webpack');

  return require('@embroider/compat').compatBuild(app, Webpack, {
    staticAddonTestSupportTrees: true,
    staticAddonTrees: true,
    staticHelpers: true,
    staticModifiers: true,
    staticComponents: true,
    splitAtRoutes: ['map'],
    packagerOptions: {
      webpackConfig: {
        plugins: [new BundleAnalyzerPlugin()],
      },
    },
  });
};
