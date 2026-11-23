import Model, {
  attr,
  belongsTo,
  hasMany,
  type AsyncBelongsTo,
  type AsyncHasMany,
} from '@ember-data/model';
import type SessionModel from './session';
import type ValidationResultModel from './validation-result';

export default class ValidationReportModel extends Model {
  @attr('boolean') declare conforms?: boolean;
  @attr('date') declare created?: Date;

  @belongsTo('session', { async: true, inverse: 'validationReports' })
  declare session: AsyncBelongsTo<SessionModel>;

  @hasMany('validation-result', { async: true, inverse: 'report' })
  declare results: AsyncHasMany<ValidationResultModel>;
}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    'validation-report': ValidationReportModel;
  }
}
