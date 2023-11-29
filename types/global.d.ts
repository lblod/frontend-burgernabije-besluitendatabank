// Types for compiled templates
declare module 'frontend-lokaalbeslist/templates/*' {
  import { TemplateFactory } from 'ember-cli-htmlbars';

  const tmpl: TemplateFactory;
  export default tmpl;
}
