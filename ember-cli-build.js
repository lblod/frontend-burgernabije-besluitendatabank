"use strict";

const EmberApp = require("ember-cli/lib/broccoli/ember-app");

const environment = process.env.EMBER_ENV;
const IS_PROD = environment === "production";
const IS_TEST = environment === "test";

module.exports = function (defaults) {
  const app = new EmberApp(defaults, {
    autoImport: {
      exclude: ["flandersMunicipalities.ts"],
      useSwcParser: true,
    },
    hinting: IS_TEST,
    tests: IS_TEST,
    "ember-cli-babel": {
      includePolyfill: IS_PROD,
    },
    autoprefixer: {
      sourcemap: false,
    },
    sourcemaps: {
      enabled: IS_PROD,
    },
    fingerprint: {
      enabled: true,
    },
    "@appuniversum/ember-appuniversum": {
      disableWormholeElement: true,
    },
    "ember-cli-babel": {
      includePolyfill: true,
    },
    autoImport: {
      resolve: {
        extensions: [".js", ".json"],
      },
    },
  });

  return app.toTree();
};
