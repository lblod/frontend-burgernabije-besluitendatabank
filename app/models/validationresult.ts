import Model, { attr, belongsTo, type AsyncBelongsTo } from '@ember-data/model';
import type ReportModel from './report';
import type ValidationshapeModel from './validationshape';
import { SEVERITY } from 'frontend-burgernabije-besluitendatabank/constants/validation';

type LanguageString = { content: string; language?: string };

// The URIs are :url properties in the resources config, so they get no transform.
export default class ValidationresultModel extends Model {
  @attr() declare focusNode?: string;
  @attr('string') declare focusNodeId?: string;
  @attr() declare targetClassOfFocusNode?: string;
  @attr() declare value?: string;
  @attr() declare resultPath?: string;
  @attr() declare resultSeverity?: string;
  @attr() declare resultMessage?: LanguageString[] | LanguageString | string;
  @attr() declare sourceConstraintComponent?: string;

  @belongsTo('report', { async: true, inverse: 'validationresults' })
  declare report: AsyncBelongsTo<ReportModel>;

  @belongsTo('validationshape', { async: true, inverse: 'validationresults' })
  declare sourceShape: AsyncBelongsTo<ValidationshapeModel>;

  get passed() {
    return this.resultSeverity === SEVERITY.passed;
  }

  get messageText(): string {
    const messages = Array.isArray(this.resultMessage)
      ? this.resultMessage
      : this.resultMessage
        ? [this.resultMessage]
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
    validationresult: ValidationresultModel;
  }
}
