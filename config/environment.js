'use strict';

module.exports = function (environment) {
  const ENV = {
    modulePrefix: 'frontend-burgernabije-besluitendatabank',
    environment,
    rootURL: '/',
    locationType: 'history', // If updated to hash, change ember-plausible config
    EmberENV: {
      EXTEND_PROTOTYPES: false,
    },
    'ember-plausible': {
      enabled: false, // We enable this manually when the config is provided by the server
    },
    plausible: {
      apiHost: '{{PLAUSIBLE_APIHOST}}',
      domain: '{{PLAUSIBLE_DOMAIN}}',
    },
    APP: {
      // Here you can pass flags/options to your application instance
      // when it is created
    },
    features: {
      // define feature flags here
      'statistics-page-feature': false,
    },
  };

  if (environment === 'test') {
    ENV.locationType = 'none';
    ENV.APP.LOG_ACTIVE_GENERATION = false;
    ENV.APP.LOG_VIEW_LOOKUPS = false;
    ENV.APP.rootElement = '#ember-testing';
    ENV.APP.autoboot = false;
  }

  return ENV;
};
