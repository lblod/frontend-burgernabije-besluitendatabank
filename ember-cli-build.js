'use strict';

const EmberApp = require('ember-cli/lib/broccoli/ember-app');

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
    staticEmberSource: true,
    amdCompatibility: {
      es: [
        // au-date-range-picker imports jquery but doesn't depend on the jquery package directly. Instead it uses `@ember/jquery` which Embroider can't detect.
        // We can either update the addon to depend on jquery directly (+ ember-auto-import) or switch to a different solution that doesn't use jquery at all
        ['jquery', ['default']],
      ],
    },

    // This config is needed to work around an Ember Data v4.12 + Embroider issue
    // We can remove it once the fix is released: // https://github.com/embroider-build/embroider/issues/1506
    compatAdapters: new Map([['@ember-data/debug', null]]),
  });
};
