/**
 * Type declarations for
 *    import config from 'my-app/config/environment'
 */
declare const config: {
  VO_HEADER_WIDGET_URL: string;
  VO_FOOTER_WIDGET_URL: string;
  environment: string;
  modulePrefix: string;
  podModulePrefix: string;
  locationType: 'history' | 'hash' | 'none' | 'auto';
  rootURL: string;
  API_URL: string;
  APP: Record<string, unknown>;
};

export default config;
