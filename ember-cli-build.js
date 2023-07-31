'use strict';

const EmberApp = require('ember-cli/lib/broccoli/ember-app');
const { V1Addon } = require('@embroider/compat');

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

    // These compatAdapters are needed to work around an Ember Data v4.12 + Embroider issue
    // We can remove them once the issue is fixed or when we update to v5.4 since supposedly it's not an issue there
    // https://github.com/embroider-build/embroider/issues/1506
    compatAdapters: new Map([
      [
        // Copy of the Embroider version without the version check: https://github.com/embroider-build/embroider/blob/main/packages/compat/src/compat-adapters/%40ember-data/debug.ts
        '@ember-data/debug',
        class EmberDataDebugCompatAdapter extends V1Addon {
          get packageMeta() {
            let meta = super.packageMeta;

            // See also the compat-adapter for @ember-data/store where we make this an
            // implicit-module.
            meta.externals = [...(meta.externals ?? []), '@ember-data/store'];

            return meta;
          }
        },
      ],
      [
        // Copy of the Embroider version without the version check: https://github.com/embroider-build/embroider/blob/main/packages/compat/src/compat-adapters/%40ember-data/store.ts
        '@ember-data/store',
        class EmberDataStoreCompatAdapter extends V1Addon {
          get packageMeta() {
            let meta = super.packageMeta;

            // this is here because the compat-adapter for @ember-data/debug adds this
            // to externals because it has an undeclared peerDep on us, and thus might
            // resolve totally incorrect copies. By making it external we leave it up to
            // runtime, where we will find this implicit-module for the actual copy of
            // @ember-data/store that is active in app.
            meta['implicit-modules'] = [
              ...(meta['implicit-modules'] ?? []),
              './index.js',
            ];

            return meta;
          }
        },
      ],
    ]),
  });
};
