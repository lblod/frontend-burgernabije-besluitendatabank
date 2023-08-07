import Service from '@ember/service';
import { assert } from '@ember/debug';
import config from 'frontend-burgernabije-besluitendatabank/config/environment';

export default class FeaturesService extends Service {
  #features: Record<string, boolean> = {};

  constructor() {
    super();

    const cookieFeatures = this.#getCookieFeatures();
    this.setup({ ...config.features, ...cookieFeatures });
  }

  setup(features: Record<string, boolean>) {
    this.#features = { ...features };
  }

  isEnabled(feature: string): boolean {
    assert(
      `The "${feature}" feature is not defined. Make sure the feature is defined in the "features" object in the config/environment.js file and that there are no typos in the name.`,
      feature in this.#features
    );

    return this.#features[feature] ?? false;
  }

  // cookie has to start with 'feature-{{feature-name}}'
  #getCookieFeatures(): Record<string, boolean> {
    const cookieFeatures: Record<string, boolean> = {};
    const cookies = document.cookie.split('; ');
    for (const cookie of cookies) {
      const [name, value] = cookie.split('=');
      if (name?.startsWith('feature-')) {
        const featureName = name.replace('feature-', '');
        const featureValue = value === 'true';
        cookieFeatures[featureName] = featureValue;
      }
    }
    return cookieFeatures;
  }
}

// Don't remove this declaration: this is what enables TypeScript to resolve
// this service using `Owner.lookup('service:feature')`, as well
// as to check when you pass the service name as an argument to the decorator,
// like `@service('feature') declare altName: FeatureService;`.
declare module '@ember/service' {
  interface Registry {
    features: FeaturesService;
  }
}
