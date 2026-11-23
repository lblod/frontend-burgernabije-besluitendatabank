import Model, { attr, belongsTo, type AsyncBelongsTo } from '@ember-data/model';
import type ValidationReportModel from './validation-report';
import type ValidationShapeModel from './validation-shape';

export const SEVERITY = {
  violation: 'http://www.w3.org/ns/shacl#Violation',
  warning: 'http://www.w3.org/ns/shacl#Warning',
  info: 'http://www.w3.org/ns/shacl#Info',
  passed: 'https://schemas.link/shacl-next#Debug',
};

type LanguageString = { content: string; language?: string };

// The validation service also reports passed checks, with severity shn:Debug.
export default class ValidationResultModel extends Model {
  @attr('string') declare focusNode?: string;
  @attr('string') declare value?: string;
  @attr('string') declare resultPath?: string;
  @attr('string') declare severity?: string;
  @attr() declare message?: LanguageString[] | LanguageString | string;
  @attr('string') declare sourceConstraintComponent?: string;

  @belongsTo('validation-report', { async: true, inverse: 'results' })
  declare report: AsyncBelongsTo<ValidationReportModel>;

  @belongsTo('validation-shape', { async: true, inverse: 'results' })
  declare sourceShape: AsyncBelongsTo<ValidationShapeModel>;

  get passed() {
    return this.severity === SEVERITY.passed;
  }

  get messageText(): string {
    const messages = Array.isArray(this.message)
      ? this.message
      : this.message
        ? [this.message]
        : [];
    const strings = messages.map((m) =>
      typeof m === 'string' ? { content: m } : m,
    );
    return (
      strings.find((m) => m.language === 'nl')?.content ??
      strings.find((m) => m.language === 'en')?.content ??
      strings[0]?.content ??
      ''
    );
  }
}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    'validation-result': ValidationResultModel;
  }
}
