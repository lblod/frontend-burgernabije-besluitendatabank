"use strict";

module.exports = function (environment) {
  const ENV = {
    modulePrefix: "frontend-burgernabije-besluitendatabank",
    environment,
    rootURL: "/",
    locationType: "history",
    VO_HEADER_WIDGET_URL:
      "https://tni.widgets.burgerprofiel.dev-vlaanderen.be/api/v1/widget/3bcc4b26-e216-489c-8f11-cd9299f08199",
    VO_FOOTER_WIDGET_URL:
      "https://tni.widgets.burgerprofiel.dev-vlaanderen.be/api/v1/widget/7eed3599-96aa-435b-bc43-fe13d2fc0531",
    EmberENV: {
      EXTEND_PROTOTYPES: false,
      FEATURES: {
        // Here you can enable experimental features on an ember canary build
        // e.g. EMBER_NATIVE_DECORATOR_SUPPORT: true
      },
    },

    APP: {
      // Here you can pass flags/options to your application instance
      // when it is created
    },
  };

  // if (environment === "development") {
  //   ENV["ember-cli-mirage"] = {
  //     enabled: true,
  //   };
  // ENV.APP.LOG_RESOLVER = true;
  // ENV.APP.LOG_ACTIVE_GENERATION = true;
  // ENV.APP.LOG_TRANSITIONS = true;
  // ENV.APP.LOG_TRANSITIONS_INTERNAL = true;
  // ENV.APP.LOG_VIEW_LOOKUPS = true;
  // }

  // if (environment === "test") {
  //   // Testem prefers this...
  //   ENV.locationType = "none";

  //   // keep test console output quieter
  //   ENV.APP.LOG_ACTIVE_GENERATION = false;
  //   ENV.APP.LOG_VIEW_LOOKUPS = false;

  //   ENV.APP.rootElement = "#ember-testing";
  //   ENV.APP.autoboot = false;
  // }

  // if (environment === "production") {
  //   ENV["ember-cli-mirage"] = {
  //     enabled: true,
  //   };

  // here you can enable a production-specific feature
  // }

  return ENV;
};
