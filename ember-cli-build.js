'use strict';

const EmberApp = require('ember-cli/lib/broccoli/ember-app');

module.exports = function (defaults) {
  const app = new EmberApp(defaults, {
    'ember-cli-babel': {
      enableTypeScriptTransform: true,
    },
    '@appuniversum/ember-appuniversum': {
      disableWormholeElement: true,
    },
    autoprefixer: {
      enabled: true,
      cascade: true,
      sourcemap: true,
    },
  });

  return app.toTree();
};
