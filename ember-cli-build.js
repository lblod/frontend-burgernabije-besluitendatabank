"use strict";

const EmberApp = require("ember-cli/lib/broccoli/ember-app");

module.exports = function (defaults) {
  const app = new EmberApp(defaults, {
    autoImport: {
      exclude: ["flandersMunicipalities.ts"],
    },
    sourcemaps: {
      enabled: false,
    },
    fingerprint: {
      enabled: true,
      generateAssetMap: true,
      exclude: [
        "images/layers-2x.png",
        "images/layers.png",
        "images/marker-icon-2x.png",
        "images/marker-icon.png",
        "images/marker-shadow.png",
      ],
    },
    "@appuniversum/ember-appuniversum": {
      disableWormholeElement: true,
    },
    "ember-cli-babel": {
      includePolyfill: true,
    },
    autoImport: {
      resolve: {
        extensions: [".js", ".json"], // Specify the file extensions to resolve
      },
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
