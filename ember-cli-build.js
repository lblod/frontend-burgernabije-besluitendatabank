"use strict";

const EmberApp = require("ember-cli/lib/broccoli/ember-app");

module.exports = function (defaults) {
  const app = new EmberApp(defaults, {
    "@appuniversum/ember-appuniversum": {
      disableWormholeElement: true,
    },
    "ember-cli-babel": {
      includePolyfill: true,
    },
    autoImport: {
      webpack: {
        // node: {
        // faker: true,
        // },
      },
    },
  });
  app.import("node_modules/url-polyfill/url-polyfill.min.js");
  app.import("node_modules/@govflanders/vl-widget-polyfill/dist/index.js");
  app.import("node_modules/@govflanders/vl-widget-client/dist/index.js");

  return app.toTree();
};
