/**
 * Type declarations for
 *    import config from 'my-app/config/environment'
 */
declare const config: {
  environment: string;
  modulePrefix: string;
  podModulePrefix: string;
  locationType: 'history' | 'none';
  rootURL: string;
  APP: Record<string, unknown>;
  plausible: {
    apiHost: string;
    domain: string;
  };
  features: Record<string, boolean | string>;
  login: {
    mock: boolean;
    sessionsPath: string;
    acmidm: {
      clientId: string;
      authUrl: string;
      redirectUrl: string;
      logoutUrl: string;
      scope: string;
    };
  };
  'governing-body-disabled': string;
  maintenance: {
    enabled: string;
    message: string;
  };
};

export default config;
