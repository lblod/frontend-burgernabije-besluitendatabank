"use strict";

const EmberApp = require("ember-cli/lib/broccoli/ember-app");

module.exports = function (defaults) {
  let app = new EmberApp(defaults, {
    autoImport: {
      exclude: ["flandersMunicipalities.ts"],
      webpack: {
        node: {
          global: true,
        },
      },
    },
    "ember-cli-terser": {
      enabled: true,
      exclude: ["assets/vendor.js", "flandersMunicipalities.ts"],
    },
    "ember-cli-htmlbars-inline-precompile": {
      enabled: true,
    },
  });

  return app.toTree();
};
