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

    // https://github.com/redpencilio/ember-plausible#configuration-options
    'ember-plausible': {
      enabled: true, // Unless specified otherwise (test env), enabled by default
      apiHost: '{{PLAUSIBLE_APIHOST}}',
      domain: '{{PLAUSIBLE_DOMAIN}}',

      hashMode: false, // If locationType is hash, change to true
      //trackLocalhost: true,  // Uncomment if you want your local instance to add to the statistics

      enableAutoPageviewTracking: true, // if true, all page changes will send an event
      enableAutoOutboundTracking: false, // if true, all clicks to external websites will send an event
    },

    APP: {
      // Here you can pass flags/options to your application instance
      // when it is created
    },
  };

  if (environment === 'test') {
    ENV['ember-plausible'].enabled = false;

    ENV.locationType = 'none';
    ENV.APP.LOG_ACTIVE_GENERATION = false;
    ENV.APP.LOG_VIEW_LOOKUPS = false;
    ENV.APP.rootElement = '#ember-testing';
    ENV.APP.autoboot = false;
  }

  return ENV;
};
